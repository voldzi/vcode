#!/bin/sh
set -eu
umask 077
while true; do
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  target="/backups/analytics-$stamp.dump"
  if pg_dump -Fc > "$target.partial"; then
    mv "$target.partial" "$target"
    find /backups -maxdepth 1 -type f -name 'analytics-*.dump' -mmin +10080 -delete
    echo 'Analytics database backup completed.'
    sleep 86400
  else
    rm -f "$target.partial"
    echo 'Analytics database backup failed; retrying.' >&2
    sleep 300
  fi
done
