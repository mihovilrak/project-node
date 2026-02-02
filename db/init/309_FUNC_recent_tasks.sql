create or replace function recent_tasks(user_id integer)
returns table(
    id integer,
    name character varying,
    project_name character varying,
    holder_name character varying,
    estimated_time numeric,
    start_date date,
    due_date date,
    status_name character varying,
    priority_name character varying,
    created_by_name character varying,
    priority_color text
) as $$
begin
    return query
        select t.id,
               t.name,
               po.name as project_name,
               h.name as holder_name,
               t.estimated_time,
               t.start_date,
               t.due_date,
               ts.name as status_name,
               pi.name as priority_name,
               c.name as created_by_name,
               pi.color as priority_color
        from tasks t
        left join projects po on po.id = t.project_id
        left join users h on h.id = t.holder_id
        left join users c on c.id = t.created_by
        left join task_statuses ts on ts.id = t.status_id
        left join priorities pi on pi.id = t.priority_id
        where t.assignee_id = recent_tasks.user_id
        and ts.name not in ('Deleted', 'Cancelled', 'Done')
        order by t.created_on desc
        limit 10;
end;
$$ language plpgsql;