# Upgrade

Upgrades replace the application image; the `migrate` service updates the database schema on start. This page covers upgrading and rolling back.

Releases are published as `ghcr.io/mihovilrak/project-node:<version>` for every `v*` tag, signed with cosign.

## Steps

1. Read the release notes for the versions between yours and the target.
2. Back up the database, uploaded files and secrets. See [Backup and restore](/operations/backup-restore).

   ```sh
   docker compose exec backup sh /app/db/backup.sh
   ```

3. Check out the matching release of the repository, so `docker-compose.yml` and `.env.example` match the image:

   ```sh
   git fetch --tags
   git checkout v1.1.0
   ```

4. Compare `.env.example` with your `.env` and add any new variables.
5. Set the image in `.env`:

   ```sh
   APP_IMAGE=ghcr.io/mihovilrak/project-node:1.1.0
   ```

6. Pull and restart:

   ```sh
   docker compose pull
   docker compose up -d
   ```

7. Check that `migrate` succeeded and the services are healthy:

   ```sh
   docker compose logs migrate
   docker compose ps -a
   ```

8. Sign in and spot-check a project and a task.

## Verify the image signature (optional)

```sh
cosign verify ghcr.io/mihovilrak/project-node:1.1.0 \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/mihovilrak/project-node/'
```

## Build from source instead

1. Check out the release tag as above.
2. Build and start:

   ```sh
   docker compose up -d --build
   ```

## Roll back

Schema migrations only move forward, so an older image may not work with an upgraded database.

1. Stop the stack: `docker compose down` (without `-v`).
2. Set `APP_IMAGE` back to the previous version and check out the previous tag.
3. Start only the database: `docker compose up -d db`.
4. Restore the dump taken before the upgrade. See [Restore the database](/operations/backup-restore#restore-the-database).
5. Start everything: `docker compose up -d`.
