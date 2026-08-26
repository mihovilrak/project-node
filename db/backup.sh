#!/bin/bash
# Backup PostgreSQL using .pgpass (script must not be world-readable).
# Uses PGPASSFILE to avoid PGPASSWORD in the environment.

set -e

# Kept out of DUMP_DIR: that directory is bind-mounted to the host.
PGPASS_PATH="${PGPASS_PATH:-/tmp/.pgpass_backup_$$}"
DUMP_DIR="${DUMP_DIR:-/backups}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Runs on every exit path, including a pg_dump failure under `set -e`.
cleanup() {
  rm -f "${PGPASS_PATH}"
}
trap cleanup EXIT INT TERM

# Format date
now=$(date +"%Y_%m_%d_%H-%M")
DUMP_FILE="${DUMP_DIR}/db_dump_${now}.sql.gz"

# Create .pgpass: host:port:database:username:password
umask 077
echo "${POSTGRES_HOST}:${POSTGRES_PORT}:${POSTGRES_DB}:${POSTGRES_USER}:${POSTGRES_PASSWORD}" > "${PGPASS_PATH}"
chmod 600 "${PGPASS_PATH}"
export PGPASSFILE="${PGPASS_PATH}"

# Perform the pg_dump (gzip for space)
set -o pipefail
pg_dump -U "${POSTGRES_USER}" -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" "${POSTGRES_DB}" | gzip > "${DUMP_FILE}"

unset PGPASSFILE

# Validate: dump file must exist and have non-zero size
if [ ! -s "${DUMP_FILE}" ]; then
  echo "Backup failed: ${DUMP_FILE} is missing or empty" >&2
  exit 1
fi

# Remove dumps older than 30 days
find "${DUMP_DIR}" -name "*.sql.gz" -type f -mtime +30 -delete
