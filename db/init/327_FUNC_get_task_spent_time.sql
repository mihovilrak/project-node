create or replace function get_task_spent_time(p_task_id int)
returns table (
    task_id int,
    spent_time numeric
) as $$
begin
    return query
    select
        tl.task_id,
        sum(tl.spent_time)::numeric as spent_time
    from time_logs tl
    where tl.task_id = p_task_id
    group by tl.task_id;
end;
$$ language plpgsql;
