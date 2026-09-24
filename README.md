# Project Management App

A modern, full-stack project management application built with React, TypeScript, and Node.js. The application helps teams manage projects, track time, and collaborate effectively.

User and operations documentation: <https://mihovilrak.github.io/project-node/>

## 🚀 Features

- Project and task management
- Time tracking and logging
- User authentication and authorization
- Email notifications
- Modern, responsive UI built with Material-UI
- Interactive scheduling with DevExpress Scheduler
- Data visualization with Recharts

## 🛠️ Tech Stack

### Frontend

- React 19
- TypeScript
- Material-UI (MUI) v7
- DevExpress Scheduler
- Recharts for data visualization
- React Router for navigation
- Axios for API calls

### Backend

- Node.js
- TypeScript
- PostgreSQL 18
- Docker for containerization

### Services

- Notification service
- Email service (SMTP integration)

## 📦 Project Structure

```bash
project_management_app/
├── api/               # Backend API service
├── fe/                # Frontend React application
├── db/                # Database migrations and data
├── notification-service/ # Notification handling service
├── packages/          # Code shared by api and notification-service
├── scripts/           # init-secrets.sh / init-secrets.ps1
└── docker-compose.yml # Docker composition file
```

## 🚦 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

### Installation

1. Clone the repository
2. Create a `.env` file from [.env.example](.env.example)
3. Create the secret files (see [Secrets](#-secrets)):

   ```bash
   sh scripts/init-secrets.sh        # Windows: pwsh scripts/init-secrets.ps1
   ```

4. On Linux, make the backup directory writable by the `backup` service (uid 101): `mkdir -p db/backup && sudo chown 101:101 db/backup`
5. Start the application:

   ```bash
   docker compose up -d
   ```

The application will be available at <http://localhost:3000> (the API is proxied under `/api`). Log in as `admin` with the password in `secrets/admin_password.txt`.

## 💻 Development

All packages use Yarn 1. Neither backend loads a `.env` file; export the variables in your shell. A local database with the schema and the `pm_app` role comes from the integration-test setup (Docker, port 5433):

```bash
cd api
yarn install
yarn setup-test-db
```

### Backend (api)

```bash
cd api
export POSTGRES_HOST=localhost POSTGRES_PORT=5433 POSTGRES_DB=pm_test \
  POSTGRES_USER=pm_app POSTGRES_PASSWORD=pm_app_password \
  SESSION_SECRET=dev-session-secret NODE_ENV=development FE_URL=http://localhost:3000
yarn dev          # http://localhost:5000
```

### Frontend (fe)

```bash
cd fe
yarn install
yarn start        # http://localhost:3000, proxies /api to localhost:5000
```

### Notification service

Uses the same `POSTGRES_*` variables as the API. Email stays off until it is enabled in Settings > System Settings; then it also needs `EMAIL_USER` and `EMAIL_PASSWORD`.

```bash
cd notification-service
yarn install
yarn dev          # health checks on http://localhost:5001/health and /ready
```

### Checks

Each of `api`, `fe` and `notification-service` has `yarn lint`, `yarn type-check` and `yarn test`. API integration tests are described [below](#-running-integration-tests-locally).

## 🔒 Environment Variables

Non-secret settings live in `.env` (see [.env.example](.env.example)):

- `POSTGRES_DB`, `POSTGRES_USER`: Database and its owner (used only for migrations and backups)
- `APP_DB_USER` (default `pm_app`): Non-superuser role the api and notification service connect as
- `ADMIN_EMAIL`, `ADMIN_PASSWORD_FORCE_RESET`: Default `admin` user, created on first start
- `BACKUP_TIME`, `BACKUP_RETENTION_DAYS`: Daily backup time (`HH:MM` in `TZ`, default `00:00`) and retention (default 30 days)
- `EMAIL_USER`: SMTP user. Host, port, TLS, sender address and the enable switch live in Settings > System Settings and are stored in the database
- `METRICS_ENABLED`: Set to `true` to make the notification service log counters (sent, errors, dead-lettered) every 30s (default off)
- `NODE_ENV`, `FE_URL`, `TZ`, `LOG_LEVEL`

## 🔑 Secrets

Passwords are not kept in `.env`. [docker-compose.yml](docker-compose.yml) reads them as Docker secrets from `./secrets/` (git-ignored) and passes each service only the ones it needs, as `*_FILE` paths under `/run/secrets`:

| File | Used by | Purpose |
| --- | --- | --- |
| `postgres_password.txt` | db, migrate, backup | Database superuser (`POSTGRES_USER`) |
| `app_db_password.txt` | migrate, api, notifications | `APP_DB_USER` role |
| `admin_password.txt` | migrate | Initial `admin` user |
| `session_secret.txt` | api | Session signing key |
| `email_password.txt` | api, notifications | SMTP password (empty if email is off) |

- `scripts/init-secrets.sh` (or `init-secrets.ps1`) creates missing files with random 48-character values and leaves existing ones untouched. `email_password.txt` is created empty.
- Outside Swarm, Compose secrets are plain bind mounts and ignore `uid`/`gid`/`mode`, so on Linux the files must be readable by the container users: `chmod 644 secrets/*.txt` (the script does this). Keep the `secrets/` directory itself `700`.
- Values are used verbatim; trailing newlines are stripped.
- Outside Compose (local development, CI) every service still accepts the plain variables (`POSTGRES_PASSWORD`, `APP_DB_PASSWORD`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `EMAIL_PASSWORD`) or the matching `*_FILE` path. Setting both forms of one variable is an error.
- `postgres_password.txt` only takes effect when the database volume is first initialized. On an existing database it must hold the current superuser password; change it with `ALTER ROLE` first, then update the file. `migrate` re-applies `app_db_password.txt` to the app role on every run; `admin_password.txt` only seeds a missing admin unless `ADMIN_PASSWORD_FORCE_RESET=true`.

### Migrating an existing `.env` deployment

Copy each password from `.env` into its file unchanged (strip any quotes Compose would have removed), then take the lines out of `.env`:

```bash
mkdir -p secrets && chmod 700 secrets
env_value() { sed -n "s/^$1=//p" .env | tail -n 1; }
printf '%s' "$(env_value POSTGRES_PASSWORD)" > secrets/postgres_password.txt
printf '%s' "$(env_value APP_DB_PASSWORD)"   > secrets/app_db_password.txt
printf '%s' "$(env_value ADMIN_PASSWORD)"    > secrets/admin_password.txt
printf '%s' "$(env_value SESSION_SECRET)"    > secrets/session_secret.txt
printf '%s' "$(env_value EMAIL_PASSWORD)"    > secrets/email_password.txt
chmod 644 secrets/*.txt
sed -i.bak -E '/^(POSTGRES_PASSWORD|APP_DB_PASSWORD|ADMIN_PASSWORD|SESSION_SECRET|EMAIL_PASSWORD)=/d' .env
docker compose up -d
```

Check the files, then delete `.env.bak`. Keeping the same values means no password changes and existing sessions stay valid.

## 🐳 Docker

[docker-compose.yml](docker-compose.yml) runs one image as several services:

- `db`: PostgreSQL (no port exposed to the host)
- `migrate`: one-shot; applies `db/init`, creates the app role and seeds the admin, then exits
- `api`: Express API
- `notifications`: notification/email service
- `web`: nginx serving the frontend and proxying `/api` to `api` (port 3000)
- `backup`: daily `pg_dump` into `./db/backup`

## 🧪 Running integration tests locally

Requires **Docker**. Env for tests lives in **api/.env.test** (not in package.json).

From the **api** directory:

```bash
cd api
cp .env.test.example .env.test   # then edit .env.test if needed
yarn setup-test-db
yarn test:integration:local
```

- **setup-test-db**: Starts a Postgres container (`pm_test_db`) on port **5433** and runs `db/migrate.sh` in it (schema, app role `pm_app`).
- **test:integration:local**: Loads **.env.test** and runs integration tests (no env vars in package.json).

To run tests with custom env: set `TEST_DB_*` and `SESSION_SECRET` in `.env.test`, or run `yarn test:integration` with env set in your shell.

## Database migrations, backups and admin seed

See [db/README.md](db/README.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
