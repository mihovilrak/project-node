create or replace view v_task_created_by as
    select  t.id as task_id,
            t.created_by,
            u.name
    from tasks t
    left join users u on u.id = t.created_by; 