create or replace view v_task_assignees as
    select  t.id as task_id,
            t.assignee_id,
            u.name
    from tasks t
    left join users u on u.id = t.assignee_id; 