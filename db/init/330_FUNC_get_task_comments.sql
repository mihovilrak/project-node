create or replace function get_task_comments(p_task_id int)
returns table (
    id int,
    task_id int,
    user_id int,
    user_name text,
    comment text,
    active boolean,
    created_on timestamptz,
    updated_on timestamptz
) as $$
begin
    return query
    select
        c.id,
        c.task_id,
        c.user_id,
        u.name || ' ' || u.surname as user_name,
        c.comment,
        c.active,
        c.created_on,
        c.updated_on
    from comments c
    left join users u on u.id = c.user_id
    where c.active = true
    and c.task_id = p_task_id
    order by c.created_on desc;
end;
$$ language plpgsql;
