#!/bin/sh
# Create the default admin user using ADMIN_PASSWORD (or ADMIN_PASSWORD_FILE).
# psql reads the password with \getenv, so it is never on disk or in argv.

set -eu

. "$(dirname "$0")/pgpass.sh"

file_env ADMIN_PASSWORD
if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "ADMIN_PASSWORD not set; skipping admin seed"
  exit 0
fi

pg_env_init

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
export ADMIN_EMAIL

# An existing admin keeps whatever password it has, so a rotated credential
# survives a restart. Set ADMIN_PASSWORD_FORCE_RESET=true to overwrite it.
if [ "${ADMIN_PASSWORD_FORCE_RESET:-}" = "true" ]; then
  conflict_action="do update set password = excluded.password, updated_on = current_timestamp"
else
  conflict_action="do nothing"
fi

# psql interpolates the password into the statement text, so statement and
# error-statement logging are switched off for this transaction.
ADMIN_PASSWORD="$ADMIN_PASSWORD" psql -X -q --no-password -v ON_ERROR_STOP=1 << EOF
\getenv admin_password ADMIN_PASSWORD
\getenv admin_email ADMIN_EMAIL
begin;
set local log_statement = 'none';
set local log_min_error_statement = 'panic';
insert into users (login, name, surname, email, password, role_id)
select 'admin', 'Admin', 'PM', :'admin_email',
    crypt(:'admin_password', gen_salt('bf', 12)), r.id
from roles r
where r.name = 'Admin'
on conflict (login) ${conflict_action};
commit;
EOF

echo "Admin user seeded."
