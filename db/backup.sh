#!/bin/bash
# Backup PostgreSQL using .pgpass (script must not be world-readable).
# Uses PGPASSFILE to avoid PGPASSWORD in the environment.

set -e

PGPASS_PATH="${PGPASS_PATH:-/backups/.pgpass}"
DUMP_DIR="${DUMP_DIR:-/backups}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Format date
now=$(date +"%Y_%m_%d_%H-%M")
DUMP_FILE="${DUMP_DIR}/db_dump_${now}.sql.gz"

# Create .pgpass: host:port:database:username:password
echo "${POSTGRES_HOST}:${POSTGRES_PORT}:${POSTGRES_DB}:${POSTGRES_USER}:${POSTGRES_PASSWORD}" > "${PGPASS_PATH}"
chmod 600 "${PGPASS_PATH}"
export PGPASSFILE="${PGPASS_PATH}"

# Perform the pg_dump (gzip for space)
pg_dump -U "${POSTGRES_USER}" -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" "${POSTGRES_DB}" | gzip > "${DUMP_FILE}"

# Remove .pgpass after use
rm -f "${PGPASS_PATH}"
unset PGPASSFILE

# Validate: dump file must exist and have non-zero size
if [ ! -s "${DUMP_FILE}" ]; then
  echo "Backup failed: ${DUMP_FILE} is missing or empty" >&2
  exit 1
fi

# Remove dumps older than 30 days
find "${DUMP_DIR}" -name "*.sql.gz" -type f -mtime +30 -delete
