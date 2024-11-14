create or replace function recent_tasks(user_id integer)
returns table(
    id integer,
    name character varying,
    project character varying,
    holder character varying,
    start_date date,
    due_date date,
    status character varying,
    priority character varying,
    priority_color character varying,
    created_by character varying
) as $$
begin
    return query
        select t.task_id as id, 
               t.name,
               t.project,
               t.holder,
               t.start_date,
               t.due_date, 
               t.status, 
               t.priority,
               t.created_by,
               case
                   when t.priority in ('Very high/Must', 'Urgent/ASAP') then 'error'
                   when t.priority = 'High/Should' then 'warning'
                   when t.priority = 'Normal/Could' then 'info'
                   else 'default'
               end as priority_color
        from v_tasks t
        where t.assignee_id = user_id
        and t.status not in ('Deleted', 'Cancelled', 'Done')
        order by t.created_on desc
        limit 10;
end;
$$ language plpgsql;