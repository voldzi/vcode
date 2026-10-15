# VCode retention: 15 October 2026

The infrastructure owner's delegation was checked against the direct human
authorization in the infrastructure-owner chat. Scope is VCode-owned
release/build artifacts and images only. No restart or production change is
authorized by this maintenance task.

Operator paths below are placeholders from the private operations inventory.
Set `VCODE_OPERATIONS_ROOT` for the installed tools; `VCODE_RETENTION_ROOT` is
its private retention subdirectory. No private production path is published here.

## Installed and checked

`$VCODE_RETENTION_ROOT/vcode-retention.py` and its private policy run daily at
**04:17 Europe/Prague** through the existing user's cron. The existing 27-line
crontab was preserved. The actual plan and apply completed at 19:05/19:06 with
unchanged VCode container identities, images, running states and start times.
**Zero images or tags were selected or removed.**

The inventory found 60 images under the broader `vcode-prod-*` prefix. Mutation
is limited to the exact `vcode-prod-web` and `vcode-prod-blog` repositories.
Six were protected by containers/current/rollback generations, 48 were younger
than 14 days, and six had foreign/manual protection. Virtual image sizes are
not a reclaimable-byte estimate.

The three registered generations are:

1. `tomato-languages-20261015`: current accepted web and actual unchanged blog.
2. `tomato-showcase-20261015`: preceding accepted web/blog pair.
3. `election-analyst-showcase-20261014-runtime-patch`: second accepted return pair.

All receipt hashes and required images were read back and verified. Their entire
release trees, source, migration files, runtime/rollback overlays and receipts
remain in place. All running **and stopped** container image references, across
all applications, are protected. Other VCode service repositories are outside
the deletion allowlist and remain preserved.

## Fail-closed contract

- Exact current web/blog runtime must match the registered accepted generation;
  a new or rolled-back deployment stops cleanup until registered.
- At least two distinct accepted rollback generations and their image identities
  must exist. Missing/changed receipt or image stops cleanup.
- Only accepted, fully classified owned aliases older than 14 days are eligible.
  Foreign aliases, unaccepted builds, untagged images and explicit `rollback`,
  `before-`, `keep-`, `protected` or runtime-base aliases remain held.
- Plan is saved before mutation; policy, acceptance evidence, every container
  reference and image aliases are rechecked before each individual tag removal.
  Removal uses `docker image rm --no-prune` without force.
- No global prune, build-cache prune, container/volume/database/download/backup
  deletion or private-registry inspection is performed. Release directories are
  retained: many are referenced by live Compose overlays and some contain private
  acceptance/configuration material. No secret-free, dependency-complete retirement
  manifest has yet been proved for deleting those directories.
- Infrastructure retention/build/deployment activity defers the operation. VCode
  deploys and retention share `$VCODE_RETENTION_ROOT/deployment.lock`. The central
  policy owns different tagged repositories and does not remove release folders;
  VCode does not alter its service or ephemeral runtime lock directory.

Future VCode deployment commands must hold the same lock, for example:

```sh
flock -n $VCODE_RETENTION_ROOT/deployment.lock python3 "$VCODE_RELEASE_ROOT/RELEASE/release.py" activate
```

After the accepted receipt is written and that deployment command has released
its lock, register it with:

```sh
python3 $VCODE_RETENTION_ROOT/register-vcode-release.py RELEASE
```

Registration requires a complete accepted receipt matching the actual running
web/blog images. It atomically retains the previous two distinct generations.
Do not fabricate receipts or register a failed build. The new deployment's images
are protected by its containers and the age floor before registration; retention
also refuses the unregistered runtime.

## Storage findings and X5

The application tree is about 10.27 GB decimal; roughly 10.19 GB is `.downloads`,
not temporary build cache. These Recall distribution/private operating files
remain untouched. Releases use about 2.94 GB decimal; Masáže directories inside
that root belong to another application and were not classified for deletion.
Backups remain untouched.

X5 was verified as `/dev/sdb1`, ext4, rw, mounted at `$VCODE_X5_ROOT`, with
about 51 GB free. `$VCODE_X5_ROOT/cache` is root-owned and not writable by the
deployment account; the VCode namespace does not exist. Broad passwordless sudo
is unavailable. **No cache or data migration is claimed.** Infrastructure's root
operator must provision a private VCode namespace before future disposable build
contexts/cache can use it. Existing executable release/rollback contexts must not
be moved by a symlink substitution. Docker's image store remains on the root disk.

## Evidence and validation

The server holds `plan-20261015.json`, `apply-20261015.json`, private `policy.json`
and `schedule-20261015.json` in `$VCODE_RETENTION_ROOT/`. No access keys or raw
runtime environment are included in the audit. Thirteen isolated safety tests
cover stopped/foreign container protection, foreign/unaccepted aliases, manual
holds, age floor, missing rollback, changed receipt and unregistered runtime.
Source tools are in `scripts/ops/`. Final project-wide `pnpm check`, all 201
tests and the 188-page build passed with the existing signed Recall build proof.
The first documentation check found private operational paths; those were
replaced with placeholders before final acceptance. This maintenance does not
replace web/blog containers.

Before changing these destructive-operation guards, rerun
`python3 -B -m unittest discover -s scripts/ops -p 'test_*.py'` as well as the
project gates. Later on the same day the accepted Tomato-click release was
registered: current `tomato-clicks-20261015-r2`, returns
`tomato-languages-20261015` and `tomato-showcase-20261015`. The prior dashboard
image received an explicit stable return tag before its separate feature update.
The maintenance task itself removed nothing and did not restart production.
