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
               t.project_name,
               t.holder_name,
               t.estimated_time,
               t.start_date,
               t.due_date, 
               t.status_name, 
               t.priority_name,
               t.created_by_name,
               case
                   when t.priority_name in ('Very high/Must', 'Urgent/ASAP') then 'error'
                   when t.priority_name = 'High/Should' then 'warning'
                   when t.priority_name = 'Normal/Could' then 'info'
                   else 'default'
               end as priority_color
        from v_tasks t
        where t.assignee_id = user_id
        and t.status_name not in ('Deleted', 'Cancelled', 'Done')
        order by t.created_on desc
        limit 10;
end;
$$ language plpgsql;