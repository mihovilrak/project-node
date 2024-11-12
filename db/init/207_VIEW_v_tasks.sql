create or replace view v_tasks as 
    select  t.id as task_id,
            t.project_id,
            po.name as project,
            t.holder_id,
            h.name as holder,
            t.assignee_id,
            a.name as assignee,
            t.description,
            ts.status,
            pi.priority,
            t.start_date,
            t.due_date,
            t.end_date,
            c.name as created_by,
            t.created_on::timestamp(0)
    from tasks t 
    left join projects po on po.id = t.project_id
    left join v_task_holders h on h.holder_id = t.holder_id
    left join v_task_assignees a on a.assignee_id = t.assignee_id
    left join v_task_created_by c on c.created_by = t.created_by
    left join task_statuses ts on ts.id = t.status_id
    left join priorities pi on pi.id = t.priority_id;