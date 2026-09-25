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
├── docs/              # Documentation site (VitePress)
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

For production (HTTPS, backups, upgrades, monitoring) follow the [Operations](#-operations) guides.

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

### Documentation site

```bash
cd docs
yarn install
yarn docs:dev     # http://localhost:5173
```

### Checks

Each of `api`, `fe` and `notification-service` has `yarn lint`, `yarn type-check` and `yarn test`. API integration tests are described [below](#-running-integration-tests-locally).

## 📚 Operations

Full guides are on the [documentation site](https://mihovilrak.github.io/project-node/):

- [Install](https://mihovilrak.github.io/project-node/operations/install): requirements, services and first start
- [Configuration](https://mihovilrak.github.io/project-node/operations/configuration): every `.env` variable, secret files and rotation
- [TLS and reverse proxy](https://mihovilrak.github.io/project-node/operations/tls-reverse-proxy): serving over HTTPS with Caddy or nginx
- [Backup and restore](https://mihovilrak.github.io/project-node/operations/backup-restore): database, uploaded files and secrets
- [Upgrade](https://mihovilrak.github.io/project-node/operations/upgrade): new images, signature checks and rollback
- [Monitoring](https://mihovilrak.github.io/project-node/operations/monitoring): health checks, logs and metrics

## 🔒 Environment Variables

Non-secret settings live in `.env`; [.env.example](.env.example) lists them with defaults. Set `FE_URL` to the public address in production. SMTP host, port, sender and the email switch are set in the app under Settings > System Settings. See [Configuration](https://mihovilrak.github.io/project-node/operations/configuration).

## 🔑 Secrets

Passwords are not kept in `.env`. [docker-compose.yml](docker-compose.yml) reads them from `./secrets/` (git-ignored) and mounts each into only the services that need it:

| File | Purpose |
| --- | --- |
| `postgres_password.txt` | Database superuser (`POSTGRES_USER`) |
| `app_db_password.txt` | `APP_DB_USER` role |
| `admin_password.txt` | Initial `admin` user |
| `session_secret.txt` | Session signing key |
| `email_password.txt` | SMTP password (empty if email is off) |

Quick steps:

1. Run `sh scripts/init-secrets.sh` (Windows: `pwsh scripts/init-secrets.ps1`). It creates missing files with random values and leaves existing ones untouched.
2. Keep `secrets/` at mode `700` and the files at `644` (the script does this).
3. To change a value, write it with no trailing newline and run `docker compose up -d --force-recreate`.

Rotation caveats and moving passwords out of an older `.env` are covered in [Configuration](https://mihovilrak.github.io/project-node/operations/configuration#secrets-secrets-txt).

## 🐳 Docker

[docker-compose.yml](docker-compose.yml) runs one image as `db`, `migrate` (one-shot schema and admin seed), `api`, `notifications`, `web` (nginx on port 3000, proxies `/api`) and `backup` (daily `pg_dump` into `./db/backup`). See [Install](https://mihovilrak.github.io/project-node/operations/install).

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
