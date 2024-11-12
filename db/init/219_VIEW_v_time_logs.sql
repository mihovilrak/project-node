create or replace view v_time_logs as
select 
    tl.id,
    t.project_id,
    p.name as project_name,
    tl.task_id,
    t.title as task_title,
    tl.user_id,
    u.name || ' ' || u.last_name as user,
    tl.spent_time,
    tl.description,
    tl.activity_type_id 
from time_logs tl
join tasks t on tl.task_id = t.id
join projects p on t.project_id = p.id
join users u on tl.user_id = u.id;