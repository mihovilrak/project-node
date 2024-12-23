create or replace view v_tasks as 
    select  t.id,
            t.name,
            t.project_id,
            po.name as project_name,
            t.holder_id,
            h.name as holder_name,
            t.assignee_id,
            a.name as assignee_name,
            t.parent_id,
            pt.name as parent_name,
            t.description,
            t.type_id,
            tt.name as type_name,
            ts.name as status_name,
            pi.name as priority_name,
            t.start_date,
            t.due_date,
            t.end_date,
            t.progress,
            c.name as created_by_name,
            t.created_on::timestamp(0),
            t.estimated_time
    from tasks t 
    left join projects po on po.id = t.project_id
    left join users h on h.id = t.holder_id
    left join users a on a.id = t.assignee_id
    left join users c on c.id = t.created_by
    left join task_types tt on tt.id = t.type_id
    left join task_statuses ts on ts.id = t.status_id
    left join priorities pi on pi.id = t.priority_id
    left join v_parent_tasks pt on pt.id = t.parent_id;