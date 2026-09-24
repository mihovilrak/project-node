#!/bin/sh
# Creates the Docker secret files used by docker-compose.yml in ./secrets.
# Existing files are never overwritten, so re-running is safe.

set -eu

SECRETS_DIR="$(cd "$(dirname "$0")/.." && pwd)/secrets"

umask 077
mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

random_secret() {
  if command -v openssl > /dev/null 2>&1; then
    openssl rand -base64 64 | tr -dc 'A-Za-z0-9' | cut -c 1-48
  else
    LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 48
  fi
}

# Compose bind-mounts these files as-is (uid/gid/mode are ignored outside
# Swarm), so they must be readable by the container users.
write_secret() {
  file="$SECRETS_DIR/$1.txt"
  if [ -e "$file" ]; then
    echo "Keeping existing $file"
    return
  fi
  printf '%s' "$2" > "$file"
  chmod 644 "$file"
  echo "Created $file"
}

for name in postgres_password app_db_password admin_password session_secret; do
  write_secret "$name" "$(random_secret)"
done
write_secret email_password ""

cat << EOF

secrets/email_password.txt is empty. If email is enabled, put the SMTP
password in it (for example: printf '%s' 'your-password' > secrets/email_password.txt).
The admin login is "admin"; its password is in secrets/admin_password.txt.
EOF
