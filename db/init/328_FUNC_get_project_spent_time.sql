create or replace function get_project_spent_time(p_project_id int)
returns table (
    id int,
    spent_time numeric
) as $$
begin
    return query
    select
        t.project_id as id,
        sum(tl.spent_time)::numeric as spent_time
    from time_logs tl
    join tasks t on tl.task_id = t.id
    where t.project_id = p_project_id
    group by t.project_id;
end;
$$ language plpgsql;
