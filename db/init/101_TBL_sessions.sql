create table if not exists session (
  sid varchar primary key not null collate "default",
  sess json not null,
  expire timestamptz not null
)
with (OIDS=FALSE);

create index if not exists session_expire_idx on session (expire);