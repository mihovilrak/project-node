# Sourced by the db scripts. Writes a private .pgpass for $POSTGRES_USER so the
# password never reaches argv or the process environment (PGPASSWORD).

# file_env VAR: if VAR_FILE is set, load VAR from that file (Docker secrets).
# The value is set as a shell variable only, so it is not exported to child
# processes unless it already came from the environment.
file_env() {
  _fe_var="$1"
  eval "_fe_val=\${$_fe_var:-}"
  eval "_fe_file=\${${_fe_var}_FILE:-}"
  if [ -n "$_fe_val" ] && [ -n "$_fe_file" ]; then
    echo "Both $_fe_var and ${_fe_var}_FILE are set; use only one" >&2
    exit 1
  fi
  if [ -n "$_fe_file" ]; then
    if [ ! -r "$_fe_file" ]; then
      echo "Cannot read ${_fe_var}_FILE ($_fe_file)" >&2
      exit 1
    fi
    _fe_val=$(cat "$_fe_file")
    eval "$_fe_var=\$_fe_val"
  fi
  unset _fe_var _fe_val _fe_file
}

pgpass_escape() {
  printf '%s' "$1" | sed 's/[\\:]/\\&/g'
}

pgpass_init() {
  umask 077
  PGPASSFILE=$(mktemp /tmp/.pgpass.XXXXXX)
  export PGPASSFILE
  trap 'rm -f "$PGPASSFILE"' EXIT
  trap 'exit 1' INT TERM
  printf '*:*:*:%s:%s\n' \
    "$(pgpass_escape "${POSTGRES_USER}")" \
    "$(pgpass_escape "${POSTGRES_PASSWORD}")" > "$PGPASSFILE"
}

# Connection settings shared by migrate.sh, seed-admin.sh and backup.sh.
pg_env_init() {
  file_env POSTGRES_PASSWORD
  if [ -z "${POSTGRES_PASSWORD:-}" ]; then
    echo "POSTGRES_PASSWORD or POSTGRES_PASSWORD_FILE is required" >&2
    exit 1
  fi
  export PGHOST="${POSTGRES_HOST:-db}"
  export PGPORT="${POSTGRES_PORT:-5432}"
  export PGUSER="${POSTGRES_USER}"
  export PGDATABASE="${POSTGRES_DB}"
  pgpass_init
}
