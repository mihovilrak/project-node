create or replace view v_tasks as 
    select  t.id,
            t.name,
            t.project_id,
            po.name as project_name,
            t.holder_id,
            h.name as holder_name,
            t.assignee_id,
            a.name as assignee_name,
            t.description,
            ts.name as status,
            pi.name as priority,
            t.start_date,
            t.due_date,
            t.end_date,
            c.name as created_by,
            t.created_on::timestamp(0)
    from tasks t 
    left join projects po on po.id = t.project_id
    left join users h on h.id = t.holder_id
    left join users a on a.id = t.assignee_id
    left join users c on c.id = t.created_by
    left join task_statuses ts on ts.id = t.status_id
    left join priorities pi on pi.id = t.priority_id;