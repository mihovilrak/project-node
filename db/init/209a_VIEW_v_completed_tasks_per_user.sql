create or replace view v_completed_tasks_per_user as
    select  assignee_id,
            count(*) as completed_tasks
    from tasks
    where status_id = 5  -- Done
    group by assignee_id;
