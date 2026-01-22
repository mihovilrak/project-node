create or replace view v_system_stats as
select
    (select count(*) from users where status_id != 3) as active_users,
    (select count(*) from projects where status_id != 3) as active_projects,
    (select count(*) from tasks where status_id != 3) as active_tasks,
    (select count(*) from time_logs where created_on >= now() - interval '30 days') as time_logs_30d;