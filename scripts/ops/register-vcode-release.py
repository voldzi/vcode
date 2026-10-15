#!/usr/bin/env python3
"""Register a completed, runtime-matching release before retention can resume."""
import fcntl
import importlib.util
import json
from pathlib import Path
import sys

spec = importlib.util.spec_from_file_location('retention', Path(__file__).with_name('vcode-retention.py'))
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)


def main():
    if len(sys.argv) != 2 or not r.RELEASE.fullmatch(sys.argv[1]):
        raise RuntimeError('Expected one accepted release directory name')
    base = r.ROOT / 'retention'
    with (base / 'deployment.lock').open('a+') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        policy_path = base / 'policy.json'
        old_hash = r.digest(policy_path)
        policy = json.loads(policy_path.read_text())
        accepted = r.receipts(r.ROOT)
        release = sys.argv[1]
        if release not in accepted:
            raise RuntimeError('No recognized complete acceptance receipt')
        generations = [{'release': release, 'receiptSHA256': accepted[release]['receiptSHA256']}]
        generations += [x for x in policy['generations'] if x['release'] != release][:2]
        candidate = {**policy, 'generations': generations}
        r.protected_images(candidate, accepted, r.images(), r.containers())
        if r.digest(policy_path) != old_hash:
            raise RuntimeError('Policy changed concurrently')
        r.private_json(policy_path, candidate)
        print('Registered accepted current release and two verified rollback generations.')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('VCODE_REGISTRATION_REFUSED: ' + str(exc))
        raise SystemExit(1)
