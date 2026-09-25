# Configuration

Project Node takes configuration from three places: `.env`, secret files and the admin **Settings** screen. This page lists what goes where and how to change it.

## Environment (`.env`)

Edit `.env`, then run `docker compose up -d` to recreate the affected services.

| Variable | Default | Purpose |
| --- | --- | --- |
| `POSTGRES_USER`, `POSTGRES_DB` | `pm`, `pm_db` | Database owner and name. The owner is used only by `migrate` and `backup`. |
| `APP_DB_USER` | `pm_app` | Non-superuser role the API and notification service connect as. |
| `TZ` | | Time zone for the containers and the backup schedule, for example `Europe/Zagreb`. |
| `FE_URL` | | Public address, for example `https://pm.example.com`. Required in production. It sets the allowed CORS origin, and an `https://` value makes the session cookie `Secure`. |
| `NODE_ENV` | `production` | |
| `LOG_LEVEL` | `info` | Start-up level: `trace`, `debug`, `info`, `warn`, `error` or `fatal`. Replaced by the stored **Log Level** setting once the database is reachable. |
| `ADMIN_EMAIL` | `admin@example.com` | Email of the `admin` user created on first start. |
| `ADMIN_PASSWORD_FORCE_RESET` | `false` | `true` overwrites the existing admin's password with `secrets/admin_password.txt` on the next start. Set it back afterwards. |
| `EMAIL_USER` | | SMTP username. |
| `BACKUP_TIME` | `00:00` | Daily backup time, `HH:MM` in `TZ`. |
| `BACKUP_RETENTION_DAYS` | `30` | Days of dumps to keep. |
| `METRICS_ENABLED` | `false` | `true` makes the notification service log counters every 30 seconds. See [Monitoring](/operations/monitoring). |
| `APP_IMAGE` | `ghcr.io/mihovilrak/project-node:1.0.0` | Image for all app services. See [Upgrade](/operations/upgrade). |

## Secrets (`secrets/*.txt`)

Passwords never go in `.env`. Compose mounts each file into only the services that need it, under `/run/secrets`.

| File | Purpose |
| --- | --- |
| `postgres_password.txt` | Database superuser. |
| `app_db_password.txt` | `APP_DB_USER` role. Re-applied to the role on every start. |
| `admin_password.txt` | Initial `admin` user. |
| `session_secret.txt` | Signs session cookies. |
| `email_password.txt` | SMTP password. Leave empty if email is off. |

`scripts/init-secrets.sh` (or `init-secrets.ps1`) creates missing files with random 48-character values. Keep the `secrets/` directory mode `700` and the files readable by the container users (`644`).

### Rotate a secret

1. Write the new value into the file, with no trailing newline:

   ```sh
   printf '%s' 'new-value' > secrets/session_secret.txt
   ```

2. Recreate the services that use it:

   ```sh
   docker compose up -d --force-recreate
   ```

Notes:

- Changing `session_secret.txt` signs everyone out.
- `postgres_password.txt` only takes effect when the database is first created. On an existing database, run `ALTER ROLE` first, then update the file.
- `app_db_password.txt` is applied by `migrate` on every start, so a plain restart is enough.

### Move passwords out of an old `.env`

Older deployments kept passwords in `.env`. To move them into secret files with the same values, so no password changes and sessions stay valid:

1. Copy each value into its file. Strip any quotes Compose would have removed.

   ```sh
   mkdir -p secrets && chmod 700 secrets
   env_value() { sed -n "s/^$1=//p" .env | tail -n 1; }
   printf '%s' "$(env_value POSTGRES_PASSWORD)" > secrets/postgres_password.txt
   printf '%s' "$(env_value APP_DB_PASSWORD)"   > secrets/app_db_password.txt
   printf '%s' "$(env_value ADMIN_PASSWORD)"    > secrets/admin_password.txt
   printf '%s' "$(env_value SESSION_SECRET)"    > secrets/session_secret.txt
   printf '%s' "$(env_value EMAIL_PASSWORD)"    > secrets/email_password.txt
   chmod 644 secrets/*.txt
   ```

2. Remove the lines from `.env` and restart:

   ```sh
   sed -i.bak -E '/^(POSTGRES_PASSWORD|APP_DB_PASSWORD|ADMIN_PASSWORD|SESSION_SECRET|EMAIL_PASSWORD)=/d' .env
   docker compose up -d
   ```

3. Check the files, then delete `.env.bak`.

Outside Compose (local development, CI) each service still accepts the plain variables (`POSTGRES_PASSWORD` and so on) or a matching `*_FILE` path. Setting both forms of one variable is an error.

## Settings in the app

Branding, the welcome message, SMTP host, port and TLS, the sender address and the email on/off switch live in the database. Administrators change them under **Settings** > **System** without restarting. See [Settings](/admin/settings).

The **Log Level** field on that screen overrides `LOG_LEVEL` once each service has read it from the database. See [Monitoring](/operations/monitoring#logs).
