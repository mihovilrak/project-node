# Monitoring

Health checks, logs and notification counters show whether Project Node is working. This page covers what to watch and how.

## Health checks

Compose checks each service every 30 seconds. See the results with:

```sh
docker compose ps
```

| Service | Endpoint | Healthy when |
| --- | --- | --- |
| `web` | `GET /healthz` on port 8080 | nginx is serving. Does not touch the API. |
| `api` | `GET /api/health` | The API can query the database. Returns `503` otherwise. |
| `notifications` | `GET /ready` on port 5001 | The service can query the database. |
| `notifications` | `GET /health` on port 5001 | The last SMTP check passed, or email is off. The check runs every minute. |
| `db` | `pg_isready` | PostgreSQL accepts connections. |

For an external uptime check, poll `https://pm.example.com/api/health` through your proxy. It covers the proxy, `web`, `api` and the database.

The notification endpoints are internal. Query them with:

```sh
docker compose exec notifications wget -qO- http://127.0.0.1:5001/ready
docker compose exec notifications wget -qO- http://127.0.0.1:5001/health
```

An unhealthy `notifications` service with a healthy database usually means the SMTP settings or credentials are wrong. Use **Send Test Email** under [Settings](/admin/settings#send-a-test-email) to see the error.

## Logs

The API and notification service write JSON lines (pino). Passwords and secrets are redacted.

```sh
docker compose logs -f api
docker compose logs -f notifications
docker compose logs --since 1h web
```

- Set the level with `LOG_LEVEL` in `.env`, then run `docker compose up -d`.
- Docker keeps up to three 10 MB log files per container.
- Ship logs elsewhere with a Docker logging driver or an agent that reads the container logs.

## Notification metrics

Set `METRICS_ENABLED=true` in `.env` and run `docker compose up -d`. The notification service then logs a `metrics_update` line at most every 30 seconds with:

| Field | Meaning |
| --- | --- |
| `notificationsSent` | Emails sent. |
| `emailErrors` | Failed send attempts. |
| `notificationErrors` | Processing errors. |
| `notificationsDeadLettered` | Emails given up on after 5 attempts. |
| `lastProcessingTime` | When the last batch ran. |

Counters reset when the service restarts.

## What to alert on

- A service that stays `unhealthy`, or `migrate` exiting non-zero.
- `/api/health` failing from outside.
- `Notification dead-lettered` log lines, or a rising `notificationsDeadLettered`.
- No new file in `./db/backup` in the last day.
- Disk space on the volume that holds Docker data and `./db/backup`.
