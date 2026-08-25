create or replace function get_task_watchers(p_task_id int)
returns table (
    task_id int,
    user_id int,
    user_name text,
    role varchar
) as $function$

begin

    return query
    select
        w.task_id,
        w.user_id,
        u.name || ' ' || u.surname as user_name,
        r.name as role
    from watchers w
    left join users u on u.id = w.user_id
    left join roles r on r.id = u.role_id
    where w.task_id = p_task_id;

end;

$function$ language plpgsql;
