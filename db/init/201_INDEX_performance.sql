create index if not exists task_due_date_idx on tasks (due_date);
create index if not exists time_logs_log_date_idx on time_logs (log_date);

-- 333 looks up existing due-soon notifications with data @> {...}.
create index if not exists notifications_data_idx on notifications using gin (data jsonb_path_ops);

-- Session revocation deletes by user id (sessionModel.deleteUserSessions).
create index if not exists session_user_id_idx on session ((sess -> 'user' ->> 'id'));

-- Covered by notifications_user_active_created_idx, which leads with user_id.
drop index if exists notifications_user_idx;
