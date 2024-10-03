create or replace view v_task_holders as
    select  t.id as task_id,
            t.holder_id,
            u.name
    from tasks t
    left join users u on u.id = t.holder_id; 