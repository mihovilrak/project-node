#!/bin/sh
# Create or update the default admin user using ADMIN_PASSWORD from the environment.
# Uses .pgpass for DB connection; password is written only to a temp SQL file then removed.

set -e

if [ -z "${ADMIN_PASSWORD}" ]; then
  echo "ADMIN_PASSWORD not set; skipping admin seed"
  exit 0
fi

POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
PGPASS_PATH="${PGPASS_PATH:-/tmp/.pgpass_seed_$$}"
SQL_PATH="${SQL_PATH:-/tmp/seed_admin_$$.sql}"

# Escape single quotes for SQL: ' -> ''
escaped_pass=$(printf '%s' "${ADMIN_PASSWORD}" | sed "s/'/''/g")

# Create .pgpass: host:port:database:username:password
echo "${POSTGRES_HOST}:${POSTGRES_PORT}:${POSTGRES_DB}:${POSTGRES_USER}:${POSTGRES_PASSWORD}" > "${PGPASS_PATH}"
chmod 600 "${PGPASS_PATH}"
export PGPASSFILE="${PGPASS_PATH}"

# SQL: insert or update admin with hashed password
cat > "${SQL_PATH}" << EOF
INSERT INTO users (login, name, surname, email, password, role_id)
VALUES ('admin', 'Admin', 'PM', 'admin@admin.com', crypt('${escaped_pass}', gen_salt('bf', 12)), 1)
ON CONFLICT (login) DO UPDATE SET password = EXCLUDED.password, updated_on = CURRENT_TIMESTAMP;
EOF

psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -f "${SQL_PATH}"

# Remove temp files
rm -f "${PGPASS_PATH}" "${SQL_PATH}"
unset PGPASSFILE

echo "Admin user created or updated."
