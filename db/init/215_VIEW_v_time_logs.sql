create or replace view v_time_logs as
select
    tl.id,
    t.project_id,
    p.name as project_name,
    tl.task_id,
    t.name as task_name,
    tl.user_id,
    u.name || ' ' || u.surname as user,
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
left join activity_types at on at.id = tl.activity_type_id;