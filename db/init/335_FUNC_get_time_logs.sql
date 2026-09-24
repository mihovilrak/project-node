drop function if exists get_time_logs(int, int, int);

create or replace function get_time_logs(
    p_task_id int default null,
    p_user_id int default null,
    p_project_id int default null,
    p_start_date date default null,
    p_end_date date default null,
    p_activity_type_id int default null,
    p_limit int default null,
    p_offset int default 0
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
    activity_type_id smallint,
    activity_type_name varchar,
    activity_type_color varchar,
    activity_type_icon varchar,
    created_on timestamptz,
    updated_on timestamptz
) as $function$
    select
        tl.id,
        t.project_id,
        p.name,
        tl.task_id,
        t.name,
        tl.user_id,
        u.name || ' ' || u.surname,
        tl.log_date,
        tl.spent_time,
        tl.description,
        tl.activity_type_id,
        at.name,
        at.color,
        at.icon,
        tl.created_on,
        tl.updated_on
    from time_logs tl
    join tasks t on tl.task_id = t.id
    join projects p on t.project_id = p.id
    left join users u on tl.user_id = u.id
    left join activity_types at on at.id = tl.activity_type_id
    where (p_task_id is null or tl.task_id = p_task_id)
      and (p_user_id is null or tl.user_id = p_user_id)
      and (p_project_id is null or t.project_id = p_project_id)
      and (p_start_date is null or tl.log_date >= p_start_date)
      and (p_end_date is null or tl.log_date <= p_end_date)
      and (p_activity_type_id is null or tl.activity_type_id = p_activity_type_id)
    order by tl.log_date desc, tl.id desc
    limit p_limit offset coalesce(p_offset, 0);
$function$ language sql stable;
