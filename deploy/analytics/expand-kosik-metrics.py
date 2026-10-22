#!/usr/bin/env python3
"""One-site approved expansion. Public checks precede any registry write.

No visitor queries, valid production test events, credential output or proxy changes.
Default is read-only; --activate requires exact approved and published evidence.
"""
import argparse
import base64
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import urllib.error
import urllib.request

SITE = '44d46e58-a29f-45c7-aa2e-7243efdf7adc'
ORIGIN = 'https://games.zeleznalady.cz'
NOTICE_SHA = 'fb7670c278d9edfefc7209174a1a00b166633737d59dc8f32bda632d8ea09bc8'
SRI = 'sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5'
PATHS = ['/kosik/', '/kosik/pro-obcany', '/kosik/aktualne', '/kosik/akce', '/kosik/urad', '/kosik/kontakty', '/kosik/zapojte-se', '/kosik/uredni-deska']
EVENTS = ['contact-click', 'outbound-click']
FIELDS = {'captureSources', 'allowedEvents', 'metricsApprovedAt', 'metricsCollectionStartedAt'}
REGISTRY = Path('/srv/vcode/shared/analytics-sites.json')
RELEASE = Path('/srv/vcode/releases/kosik-expanded-20261022')

def require(condition, message):
    if not condition:
        raise RuntimeError(message)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def validate_site(site):
    require(site.get('id') == SITE and site.get('domain') == 'games.zeleznalady.cz', 'Wrong registration')
    require(site.get('integrationVersion') == 'vcode-public-v2' and site.get('collectionEnabled') is True, 'Existing collection must be active')
    require(site.get('allowedPaths') == PATHS and site.get('allowedEvents') == [] and site.get('captureSources') is False, 'Previous approved scope changed')
    require(site.get('collectorPath') == '/kosik/metrics/collect' and site.get('runtimeIntegrity') == SRI, 'Integration changed')

def private_json(path, value):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'w') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')

def public(path, *, method='GET', foreign=False):
    require(path.startswith('/kosik/') and '..' not in path and '?' not in path, 'Unexpected public path')
    headers = {'User-Agent': 'VCode approved analytics deployment check'}
    data = None
    if method == 'POST':
        headers.update({'Content-Type': 'application/json', 'Origin': 'https://foreign.invalid' if foreign else ORIGIN})
        data = b'{}'
    request = urllib.request.Request(ORIGIN + path, data=data, method=method, headers=headers)
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None
    opener = urllib.request.build_opener(NoRedirect())
    try:
        response = opener.open(request, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        return response.status, response.read(2_000_001), response.headers

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('evidence', type=Path)
    parser.add_argument('--activate', action='store_true')
    args = parser.parse_args()
    os.umask(0o077)
    evidence = json.loads(args.evidence.read_text())
    require(evidence.get('websiteId') == SITE and evidence.get('explicitUserApproval') is True and evidence.get('exactUserResponse') == 'Schvaluji text i aktivaci', 'Missing concrete approval')
    require(evidence.get('approvedNoticeSha256') == NOTICE_SHA and sha(evidence['approvedNotice'].encode()) == NOTICE_SHA, 'Approved text changed')
    require(evidence.get('visibleNoticeVerified') is True and evidence.get('isolatedPrivacyTestsPassed') is True, 'Missing visible notice or privacy verification')
    artifacts = evidence['artifacts']
    require(len(artifacts) == 4, 'Unexpected public artifacts')
    public_files = {}
    for item in artifacts:
        status, body, _ = public(item['path'])
        require(status == 200 and sha(body) == item['sha256'], 'Published bytes differ from verified candidate')
        public_files[item['path']] = body
    config = public_files['/kosik/vcode-metrics-config.js'].decode()
    match = re.search(r'allowedEvents\s*:\s*Object\.freeze\(\[([^]]*)\]\)', config, re.S)
    require(match and re.findall(r"['\"]([^'\"]+)['\"]", match[1]) == EVENTS and re.search(r'captureSources:\s*true', config), 'Public expansion does not match approval')
    match = re.search(r'allowedPaths\s*:\s*Object\.freeze\(\[([^]]*)\]\)', config, re.S)
    require(match and re.findall(r"['\"]([^'\"]+)['\"]", match[1]) == PATHS, 'Public path scope changed')
    require(SITE in config and SRI in config, 'Public identity changed')
    runtime = public_files['/kosik/vcode-public-v2.js']
    require('sha384-' + base64.b64encode(hashlib.sha384(runtime).digest()).decode() == SRI, 'Runtime changed')
    bundles = [body for path, body in public_files.items() if re.fullmatch(r'/kosik/assets/[A-Za-z0-9_.-]+\.js', path)]
    require(len(bundles) == 1 and evidence['approvedNotice'].encode() in bundles[0], 'Notice missing from public bundle')
    for method, foreign, expected in [('POST', False, 400), ('POST', True, 403), ('GET', False, 405)]:
        status, _, headers = public('/kosik/metrics/collect', method=method, foreign=foreign)
        require(status == expected and not headers.get('Set-Cookie'), 'Collector boundary changed')
    lock = open('/srv/vcode/retention/deployment.lock', 'a')
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    require(not REGISTRY.is_symlink() and stat.S_IMODE(REGISTRY.stat().st_mode) == 0o600, 'Registry protection changed')
    identity = (REGISTRY.stat().st_dev, REGISTRY.stat().st_ino)
    with REGISTRY.open('r+b') as file:
        fcntl.flock(file, fcntl.LOCK_EX)
        original = file.read()
        rows = json.loads(original)
        matches = [s for s in rows if s.get('id') == SITE]
        require(len(matches) == 1, 'Ambiguous registration')
        current = matches[0]
        validate_site(current)
        before = json.loads(json.dumps(current))
        others = [s for s in rows if s['id'] != SITE]
        now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
        receipt = {'websiteId': SITE, 'activated': args.activate, 'recordedAt': now, 'approvedNoticeSha256': NOTICE_SHA, 'allowedEvents': EVENTS, 'captureSources': True, 'otherRegistrationsPreserved': len(others), 'originalTrafficStartPreserved': True, 'registryInodePreserved': True, 'productionEventsSent': False, 'visitorRecordsRead': False}
        if args.activate:
            private_json(RELEASE / 'registry-before.json', json.loads(original))
            current.update(captureSources=True, allowedEvents=EVENTS, metricsApprovedAt=now, metricsCollectionStartedAt=now)
            require({k: v for k, v in before.items() if k not in FIELDS} == {k: v for k, v in current.items() if k not in FIELDS}, 'Unapproved field changed')
            raw = (json.dumps(rows, ensure_ascii=False, indent=2) + '\n').encode()
            def write_all(value):
                file.seek(0)
                remaining = memoryview(value)
                while remaining:
                    remaining = remaining[os.write(file.fileno(), remaining):]
                os.ftruncate(file.fileno(), len(value))
                os.fsync(file.fileno())
            try:
                write_all(raw)
                file.seek(0)
                actual = json.loads(file.read())
                require(actual == rows and [s for s in actual if s['id'] != SITE] == others, 'Registry readback mismatch')
                require(identity == (REGISTRY.stat().st_dev, REGISTRY.stat().st_ino), 'Registry inode changed')
            except BaseException:
                write_all(original)
                raise
        private_json(RELEASE / ('activation.json' if args.activate else 'preflight.json'), receipt)
    print(json.dumps(receipt))

if __name__ == '__main__':
    main()
