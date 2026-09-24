-- Shared by the per-IP login rate limiter ('ip:' keys) and the per-account
-- failure backoff ('account:' keys) so limits hold across API instances and restarts.
create table if not exists login_attempts (
    key text primary key,
    hits int not null default 0,
    reset_at timestamptz not null
);
create index if not exists login_attempts_reset_idx on login_attempts (reset_at);
