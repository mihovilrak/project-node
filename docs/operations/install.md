# Install

Project Node runs as a Docker Compose stack on a single host. This page covers a first installation.

## Requirements

- Docker Engine with the Compose v2 plugin (`docker compose`).
- About 2 GB of free memory. The containers' memory limits add up to about 1.8 GB.
- A DNS name and a TLS reverse proxy if users reach it from other machines. See [TLS and reverse proxy](/operations/tls-reverse-proxy).

## What runs

| Service | Role |
| --- | --- |
| `db` | PostgreSQL 18. No host port. |
| `migrate` | One-shot: applies the schema, creates the app database role, seeds the `admin` user, then exits. |
| `api` | Express API on port 5000, inside the stack only. |
| `notifications` | In-app and email notifications. |
| `web` | nginx serving the frontend and proxying `/api`. Published on `127.0.0.1:3000`. |
| `backup` | Daily `pg_dump` into `./db/backup`. |

All services run from one image, `ghcr.io/mihovilrak/project-node`, with read-only root filesystems and no Linux capabilities.

## Steps

1. Clone the repository and enter it:

   ```sh
   git clone https://github.com/mihovilrak/project-node.git
   cd project-node
   ```

2. Create `.env` from the example and edit it:

   ```sh
   cp .env.example .env
   ```

   Set at least `TZ`, `ADMIN_EMAIL` (for example `admin@example.com`) and `FE_URL`, the address users will open, for example `https://pm.example.com`. See [Configuration](/operations/configuration).

3. Create the secret files. Existing files are kept.

   ```sh
   sh scripts/init-secrets.sh        # Windows: pwsh scripts/init-secrets.ps1
   ```

4. On Linux, let the `backup` service (uid 101) write dumps:

   ```sh
   mkdir -p db/backup && sudo chown 101:101 db/backup
   ```

5. Start the stack:

   ```sh
   docker compose up -d
   ```

   This pulls the published image named by `APP_IMAGE` (default `ghcr.io/mihovilrak/project-node:1.0.0`). To build from your checkout instead, run `docker compose up -d --build`.

6. Wait until every service is healthy and `migrate` has exited with code 0:

   ```sh
   docker compose ps -a
   ```

7. Open `http://localhost:3000` on the host, or your public address once the proxy is set up.
8. Sign in as `admin` with the password in `secrets/admin_password.txt`.

## After installing

1. Change the admin password under **Profile** > **Change Password**.
2. Set up TLS. See [TLS and reverse proxy](/operations/tls-reverse-proxy).
3. Configure email and branding. See [Settings](/admin/settings).
4. Create users and roles. See [Users and roles](/admin/users-and-roles).
5. Arrange offsite copies of backups. See [Backup and restore](/operations/backup-restore).
