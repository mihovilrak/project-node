# Database (db/)

## User deletion

User "deletion" is done by setting `status_id = 3` (soft delete). Tables that reference `users(id)` do not use `ON DELETE`, so hard deletes are restricted. To allow hard deletes you would need to define CASCADE/SET NULL behavior and align foreign keys.

## Status enums

Status values used across the app:

- **user_statuses**: 1 = active, 2 = inactive, 3 = deleted (soft).
- **project_statuses** / **task_statuses**: 1 = active, 2 = …, 3 = deleted/archived (e.g. `delete_project` sets `status_id = 3`; views filter with `status_id != 3`).

## Integration test database

CI and local integration tests use a Postgres database with the same schema as production. **The test DB must be initialized (or re-initialized) with the current `db/init/*.sql` scripts.**

- **CI**: The workflow runs all `db/init/*.sql` files against the service Postgres before running integration tests.
- **Local**: After any DB schema change (e.g. renamed or new functions, new tables), re-run the init scripts against your test DB so the API sees the latest schema. For example, from the repo root:
  ```bash
  for f in db/init/*.sql; do
    PGPASSWORD=pm_password psql -h localhost -p 5433 -U pm_user -d pm_test -f "$f"
  done
  ```
  Use your test DB host/port/user/password (e.g. from `api/.env.test`). If you use `yarn setup-test-db` from `api/`, ensure it runs these init scripts.

## Backup and cron

- **Script**: [backup.sh](backup.sh) uses `.pgpass` (no `PGPASSWORD` in the environment) and writes gzipped dumps to the backup directory.
- **Install**: Copy [backup.sh](backup.sh) to the path used by cron (e.g. `/usr/local/bin/backup.sh`) on the host or in the container that runs backups.
- **Cron**: [pg_dump_cron](pg_dump_cron) invokes `/usr/local/bin/backup.sh`. Ensure the cron environment has `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` set (e.g. via cron env or a wrapper that sources env and runs the script). The cron entry path must match the installed script path.
- **Admin seed**: Set `ADMIN_PASSWORD` in the app environment to create/update the default admin user after DB init (see [seed-admin.sh](seed-admin.sh)).

## Function privileges

Functions are created with default privileges (run as invoker). Use `SECURITY DEFINER` only when a function must run with elevated rights (e.g. bypass RLS); document and review any such function.

## Future: Row Level Security (RLS)

RLS is not enabled. Enabling it would require the API to set per-request session context (e.g. `set_config('app.user_id', req.session.user.id, true)`) on each connection used for that request, and policies on each table referencing that context. Without that, enabling RLS would hide all rows. RLS is left for a later phase.
