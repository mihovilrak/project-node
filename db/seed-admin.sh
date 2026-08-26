#!/bin/sh
# Create the default admin user using ADMIN_PASSWORD from the environment.
# The password is never written to disk: the SQL is piped to psql on stdin.

set -e

if [ -z "${ADMIN_PASSWORD}" ]; then
  echo "ADMIN_PASSWORD not set; skipping admin seed"
  exit 0
fi

POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
PGPASS_PATH="${PGPASS_PATH:-/tmp/.pgpass_seed_$$}"

# Runs on every exit path, including a psql failure under `set -e`.
cleanup() {
  rm -f "${PGPASS_PATH}"
}
trap cleanup EXIT INT TERM

# Escape single quotes for SQL: ' -> ''
escaped_pass=$(printf '%s' "${ADMIN_PASSWORD}" | sed "s/'/''/g")

# Create .pgpass: host:port:database:username:password
umask 077
echo "${POSTGRES_HOST}:${POSTGRES_PORT}:${POSTGRES_DB}:${POSTGRES_USER}:${POSTGRES_PASSWORD}" > "${PGPASS_PATH}"
chmod 600 "${PGPASS_PATH}"
export PGPASSFILE="${PGPASS_PATH}"

# An existing admin keeps whatever password it has, so a rotated credential
# survives a restart. Set ADMIN_PASSWORD_FORCE_RESET=true to overwrite it.
if [ "${ADMIN_PASSWORD_FORCE_RESET}" = "true" ]; then
  conflict_action="DO UPDATE SET password = EXCLUDED.password, updated_on = CURRENT_TIMESTAMP"
else
  conflict_action="DO NOTHING"
fi

psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" -v ON_ERROR_STOP=1 << EOF
INSERT INTO users (login, name, surname, email, password, role_id)
VALUES ('admin', 'Admin', 'PM', 'admin@admin.com', crypt('${escaped_pass}', gen_salt('bf', 12)), 1)
ON CONFLICT (login) ${conflict_action};
EOF

unset PGPASSFILE

echo "Admin user seeded."
