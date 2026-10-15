#!/usr/bin/env python3
"""Conservative VCode image retention. Release trees/data are never removed."""
import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

REPOS = {'vcode-prod-web', 'vcode-prod-blog'}
ROOT = Path(os.environ.get('VCODE_OPERATIONS_ROOT', '/nonexistent-vcode-operations'))
SHA = re.compile(r'^sha256:[0-9a-f]{64}$')
RELEASE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)+$')


def command(*args):
    return subprocess.check_output(args, text=True, stderr=subprocess.PIPE).strip()


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def private_json(path, data):
    path = Path(path)
    fd, name = tempfile.mkstemp(prefix='.retention-', dir=path.parent)
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def receipts(root):
    result = {}
    for directory in (root / 'releases').iterdir():
        if (directory.is_symlink() or not directory.is_dir()
                or not RELEASE.fullmatch(directory.name)
                or directory.name.startswith('masaze')):
            continue
        p = directory / 'acceptance-result.json'
        if p.is_symlink() or not p.is_file() or p.stat().st_size > 1_000_000:
            continue
        try:
            value = json.loads(p.read_text())
            web = value['webImage']
            blog = value.get('blogImage', value.get('activeBlogImageUnchanged'))
            if not SHA.fullmatch(web) or not isinstance(blog, str) or not SHA.fullmatch(blog):
                continue
            if value.get('privateBoundariesPassed') is not True:
                continue
            smoke = value['publicSmoke']
            if any(smoke.get(route) != 200 for route in ['/health', '/health/blog', '/', '/en/', '/blog/', '/en/blog/']):
                continue
            stamp = dt.datetime.fromisoformat(value['acceptedAt'].replace('Z', '+00:00'))
            if stamp.tzinfo is None:
                continue
            result[directory.name] = {'web': web, 'blog': blog, 'acceptedAt': stamp.isoformat(),
                                      'receiptSHA256': digest(p)}
        except (KeyError, ValueError, TypeError):
            continue
    return result


def containers():
    ids = command('docker', 'ps', '-aq').split()
    if not ids:
        raise RuntimeError('Container inventory missing; refusing retention')
    rows = command('docker', 'inspect', '--format',
                   '{{json .Id}}|{{json .Image}}|{{json .Name}}|{{json .State.Running}}|{{json .State.StartedAt}}', *ids)
    result = []
    for line in rows.splitlines():
        ident, image, name, running, started = map(json.loads, line.split('|'))
        result.append({'id': ident, 'image': image, 'name': name.lstrip('/'), 'running': running, 'started': started})
    return result


def images():
    ids = sorted(set(command('docker', 'image', 'ls', '-q', '--no-trunc',
                             '--filter', 'reference=vcode-prod-*').split()))
    if not ids:
        raise RuntimeError('Image inventory missing')
    rows = command('docker', 'image', 'inspect', '--format',
                   '{{json .Id}}|{{json .Created}}|{{json .RepoTags}}', *ids)
    result = []
    for line in rows.splitlines():
        ident, created, tags = map(json.loads, line.split('|'))
        result.append({'id': ident, 'created': created, 'tags': sorted(tags or [])})
    return result


def protected_images(policy, accepted, inventory, container_rows):
    generations = policy['generations']
    if len(generations) < 3 or len({g['release'] for g in generations}) != len(generations):
        raise RuntimeError('Current plus two distinct accepted rollback generations required')
    present = {i['id'] for i in inventory}
    protected = {c['image'] for c in container_rows}
    for generation in generations:
        release = generation['release']
        a = accepted.get(release)
        if not a or a['receiptSHA256'] != generation['receiptSHA256']:
            raise RuntimeError('A retained release receipt is missing or changed')
        for service in ['web', 'blog']:
            if a[service] not in present:
                raise RuntimeError('A retained release image is missing')
            protected.add(a[service])
    current = accepted[generations[0]['release']]
    for service in ['web', 'blog']:
        c = next((x for x in container_rows if x['name'] == 'vcode-prod-' + service + '-1'), None)
        if not c or not c['running'] or c['image'] != current[service]:
            raise RuntimeError('Current runtime differs from registered accepted generation; register the new release first')
    return protected


def select(inventory, protected, accepted, now, age_days=14):
    candidates, held = [], []
    cutoff = now - dt.timedelta(days=max(14, age_days))
    for image in inventory:
        reason = None
        if image['id'] in protected:
            reason = 'container_or_retained_release'
        elif dt.datetime.fromisoformat(image['created'].replace('Z', '+00:00')) >= cutoff:
            reason = 'younger_than_14_days'
        elif not image['tags']:
            reason = 'unclassified_untagged'
        else:
            for tag in image['tags']:
                repo, _, version = tag.rpartition(':')
                if repo not in REPOS or any(token in version for token in ['rollback', 'before-', 'keep-', 'protected', 'runtime-base']):
                    reason = 'foreign_or_manual_protection'
                    break
                a = accepted.get(version)
                service = 'web' if repo == 'vcode-prod-web' else 'blog'
                if not a or a[service] != image['id']:
                    reason = 'unclassified_or_unaccepted_alias'
                    break
        if reason:
            held.append({'id': image['id'], 'reason': reason})
        else:
            candidates.append(image)
    return candidates, held


def busy():
    state = subprocess.run(['systemctl', 'is-active', 'docker-safe-retention.service'], capture_output=True, text=True).stdout.strip()
    if state in ['active', 'activating', 'deactivating']:
        return 'infrastructure_retention_active'
    # Do not print command lines: unrelated processes may contain private values.
    for line in command('ps', '-eo', 'args=').splitlines():
        if re.search(r'(?:^|/)docker (?:build\b|buildx .*\bbuild\b|compose .*\b(?:build|up|down)\b)', line):
            return 'docker_deployment_or_build_active'
        if re.search(r'python\S* ' + re.escape(str(ROOT / 'releases')) + r'/\S+/(?:release|deploy|activate)[^ ]*\.py', line):
            return 'vcode_deployment_active'
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--policy', required=True, type=Path)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--report', required=True, type=Path)
    args = parser.parse_args()
    os.umask(0o077)
    if args.policy.is_symlink() or not args.policy.is_file() or args.policy.stat().st_mode & 0o077:
        raise RuntimeError('Private regular policy file required')
    base = ROOT / 'retention'
    if base.is_symlink() or not base.is_dir() or base.stat().st_uid != os.getuid() or base.stat().st_mode & 0o077:
        raise RuntimeError('Private operator-owned retention directory required')
    if (base / 'deployment.lock').is_symlink():
        raise RuntimeError('Deployment lock must not be a symlink')
    if args.policy.resolve().parent != base or args.report.resolve().parent != base:
        raise RuntimeError('Policy and audit must stay in the exact VCode retention directory')
    with (base / 'deployment.lock').open('a+') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if busy():
            raise RuntimeError('Retention deferred: deployment or infrastructure maintenance active')
        policy_hash = digest(args.policy)
        policy = json.loads(args.policy.read_text())
        if policy.get('schemaVersion') != 1 or policy.get('scope') != sorted(REPOS):
            raise RuntimeError('Invalid explicit owner scope')
        accepted = receipts(ROOT)
        before = containers()
        own_before = [c for c in before if c['name'].startswith('vcode-')]
        inv = images()
        protected = protected_images(policy, accepted, inv, before)
        selected, held = select(inv, protected, accepted, dt.datetime.now(dt.timezone.utc))
        report = {'schemaVersion': 1, 'plannedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
                  'policySHA256': policy_hash, 'protectedGenerations': policy['generations'],
                  'inventoryImages': len(inv), 'candidateImages': selected, 'held': held,
                  'releaseDirectoriesDeleted': 0, 'releaseDirectoryPolicy': 'preserve_all_until_dependencies_and_secret_free_manifest_proven',
                  'downloadFilesChanged': False, 'backupsChanged': False, 'removedTags': [], 'apply': args.apply}
        private_json(args.report, report)  # Write the complete plan before mutation.
        for image in selected if args.apply else []:
            remaining = list(image['tags'])
            for tag in image['tags']:
                if busy() or digest(args.policy) != policy_hash or receipts(ROOT) != accepted:
                    raise RuntimeError('Deployment/receipt/policy changed; stopping')
                current = containers()
                if [c for c in current if c['name'].startswith('vcode-')] != own_before:
                    raise RuntimeError('VCode runtime changed; stopping')
                # Include every stopped container, not only VCode or running containers.
                protected_images(policy, accepted, images(), current)
                if image['id'] in {c['image'] for c in current}:
                    raise RuntimeError('Candidate acquired a container reference; stopping')
                value = json.loads(command('docker', 'image', 'inspect', '--format',
                                           '{"id":{{json .Id}},"tags":{{json .RepoTags}}}', tag))
                if value['id'] != image['id'] or sorted(value['tags'] or []) != sorted(remaining):
                    raise RuntimeError('Image/tag aliases changed; stopping')
                command('docker', 'image', 'rm', '--no-prune', tag)  # Never force or prune parents.
                remaining.remove(tag)
                report['removedTags'].append({'tag': tag, 'id': image['id']})
                private_json(args.report, report)
        after = containers()
        if [c for c in after if c['name'].startswith('vcode-')] != own_before:
            raise RuntimeError('VCode post-check changed; investigate before further cleanup')
        protected_images(policy, accepted, images(), after)
        report.update(completedAt=dt.datetime.now(dt.timezone.utc).isoformat(), runtimeUnchanged=True,
                      status='applied' if args.apply else 'plan_only')
        private_json(args.report, report)
        print(json.dumps({k: report[k] for k in ['status', 'inventoryImages', 'runtimeUnchanged', 'completedAt']} | {'candidateImages': len(selected), 'removedTags': len(report['removedTags'])}))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('VCODE_RETENTION_REFUSED: ' + str(exc))
        raise SystemExit(1)
