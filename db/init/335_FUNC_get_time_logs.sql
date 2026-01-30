create or replace function get_time_logs(
    p_task_id int default null,
    p_user_id int default null,
    p_project_id int default null
)
returns table (
    id int,
    project_id int,
    project_name varchar,
    task_id int,
    task_name varchar,
    user_id int,
    "user" text,
    log_date date,
    spent_time numeric,
    description text,
    activity_type_id int,
    activity_type_name varchar,
    activity_type_color varchar,
    activity_type_icon varchar,
    created_on timestamptz,
    updated_on timestamptz
) as $$
begin
    return query
    select
        tl.id,
        t.project_id,
        p.name as project_name,
        tl.task_id,
        t.name as task_name,
        tl.user_id,
        u.name || ' ' || u.surname as "user",
        tl.log_date,
        tl.spent_time,
        tl.description,
        tl.activity_type_id,
        at.name as activity_type_name,
        at.color as activity_type_color,
        at.icon as activity_type_icon,
        tl.created_on,
        tl.updated_on
    from time_logs tl
    left join tasks t on tl.task_id = t.id
    left join projects p on t.project_id = p.id
    left join users u on tl.user_id = u.id
    left join activity_types at on at.id = tl.activity_type_id
    where (p_task_id is null or tl.task_id = p_task_id)
    and (p_user_id is null or tl.user_id = p_user_id)
    and (p_project_id is null or t.project_id = p_project_id)
    order by tl.created_on desc;
end;
$$ language plpgsql;
