create or replace view v_task_per_user as
    select  assignee_id,
            count(*) as total_tasks
    from tasks
    where status_id not in (5, 6, 7)
    group by assignee_id;