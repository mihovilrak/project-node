# Backup and restore

A full backup has three parts: the database, uploaded files and the secret files. This page covers backing up and restoring each.

| Part | Where it lives | Backed up automatically |
| --- | --- | --- |
| Database | `db_data` volume | Yes, daily into `./db/backup` |
| Uploaded files | `app_uploads` volume | No |
| Secrets | `./secrets/` | No |

The examples use the default `POSTGRES_USER=pm` and `POSTGRES_DB=pm_db`, and a Compose project named `project-node`. Volume names are prefixed with the project name; check yours with `docker volume ls`.

## Database backups

The `backup` service runs `pg_dump` every day at `BACKUP_TIME` (in `TZ`) and deletes dumps older than `BACKUP_RETENTION_DAYS`.

- Dumps are written to `./db/backup/db_dump_<timestamp>.dump` in `pg_dump` custom format (compressed).
- Each dump is read back with `pg_restore --list` before it is kept.

Run a backup now:

```sh
docker compose exec backup sh /app/db/backup.sh
```

List what a dump contains:

```sh
pg_restore --list db/backup/<file>.dump
```

## Uploaded files

Task attachments live in the `app_uploads` volume, not in the database. Archive them next to the dumps:

```sh
docker run --rm \
  -v project-node_app_uploads:/data:ro \
  -v "$PWD/db/backup":/backup \
  alpine tar czf /backup/uploads_$(date +%Y%m%d).tgz -C /data .
```

## Secrets

Copy `./secrets/` somewhere safe and private. Without `postgres_password.txt` you cannot use the restored database as-is, and a new `session_secret.txt` signs everyone out.

## Offsite copies

Dumps sit on the same host as the database and are **not encrypted**. Losing or compromising the host loses the backups too. Copy them elsewhere, encrypted, for example with a host cron job:

```sh
gpg --encrypt --recipient backups@example.com db/backup/db_dump_*.dump
aws s3 sync db/backup s3://<bucket>/pm-backups --exclude '*' --include '*.gpg'
```

Keep the decryption key off this host.

## Restore the database

1. Stop the services that write to the database:

   ```sh
   docker compose stop api notifications
   ```

2. Restore the dump. `--clean --if-exists` drops existing objects first.

   ```sh
   docker compose exec -T db pg_restore -U pm -d pm_db --clean --if-exists < db/backup/<file>.dump
   ```

   Add `-j 4` to restore in parallel, or `-t <table>` to restore one table.

3. Start everything again. `migrate` runs first and re-applies the app role's grants.

   ```sh
   docker compose up -d
   ```

## Restore uploaded files

```sh
docker compose stop api
docker run --rm \
  -v project-node_app_uploads:/data \
  -v "$PWD/db/backup":/backup:ro \
  alpine sh -c 'rm -rf /data/* && tar xzf /backup/uploads_<date>.tgz -C /data'
docker compose start api
```

Restore uploads from the same point in time as the database, so file records and files match.

## Test your backups

Restore into a scratch database regularly. An unread dump is not a backup.

```sh
docker compose exec db createdb -U pm restore_test
docker compose exec -T db pg_restore -U pm -d restore_test < db/backup/<file>.dump
docker compose exec db dropdb -U pm restore_test
```
