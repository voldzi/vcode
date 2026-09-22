#!/usr/bin/env bash
set -euo pipefail

: "${DB_HOST:?Set DB_HOST to the private PostgreSQL endpoint}"
DB_PORT="${DB_PORT:-5432}"
DB_ADMIN_USER="${DB_ADMIN_USER:-postgres}"
DB_NAME="${DB_NAME:-vcode}"
DB_APP_USER="${DB_APP_USER:-vcode_app}"
SECRET_FILE="${1:-.secrets/database_url}"

command -v psql >/dev/null 2>&1 || { echo "Chybí klient psql." >&2; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo "Chybí openssl." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Chybí python3." >&2; exit 1; }
[[ "$DB_NAME" =~ ^[a-z_][a-z0-9_]*$ ]] || { echo "Neplatný název databáze." >&2; exit 1; }
[[ "$DB_APP_USER" =~ ^[a-z_][a-z0-9_]*$ ]] || { echo "Neplatný název aplikační role." >&2; exit 1; }

read -r -s -p "Heslo PostgreSQL správce ${DB_ADMIN_USER}: " DB_ADMIN_PASSWORD
printf '\n'
export PGPASSWORD="$DB_ADMIN_PASSWORD"
trap 'unset PGPASSWORD DB_ADMIN_PASSWORD APP_PASSWORD' EXIT

PSQL=(psql -X -v ON_ERROR_STOP=1 -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d postgres)
role_exists="$("${PSQL[@]}" -Atc "SELECT 1 FROM pg_roles WHERE rolname='${DB_APP_USER}'")"
database_exists="$("${PSQL[@]}" -Atc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")"
if [[ -n "$role_exists" || -n "$database_exists" ]]; then
  echo "Odmítám měnit existující roli nebo databázi (${DB_APP_USER}, ${DB_NAME})." >&2
  exit 2
fi

APP_PASSWORD="$(openssl rand -base64 48 | tr -d '\n')"
APP_PASSWORD="$APP_PASSWORD" DB_APP_USER="$DB_APP_USER" DB_NAME="$DB_NAME" python3 - <<'PY' | "${PSQL[@]}"
import os
password = os.environ["APP_PASSWORD"].replace("'", "''")
role = os.environ["DB_APP_USER"]
database = os.environ["DB_NAME"]
print(f"CREATE ROLE {role} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD '{password}';")
print(f"CREATE DATABASE {database} OWNER {role};")
print(f"REVOKE ALL ON DATABASE {database} FROM PUBLIC;")
print(f"GRANT CONNECT, TEMPORARY ON DATABASE {database} TO {role};")
PY

encoded_password="$(APP_PASSWORD="$APP_PASSWORD" python3 - <<'PY'
import os
from urllib.parse import quote
print(quote(os.environ["APP_PASSWORD"], safe=""), end="")
PY
)"
install -d -m 0700 "$(dirname "$SECRET_FILE")"
umask 077
printf 'postgresql://%s:%s@%s:%s/%s\n' "$DB_APP_USER" "$encoded_password" "$DB_HOST" "$DB_PORT" "$DB_NAME" > "$SECRET_FILE"
chmod 600 "$SECRET_FILE"
echo "Databáze a omezená aplikační role byly vytvořeny. Connection string je uložen v chráněném souboru: $SECRET_FILE"
