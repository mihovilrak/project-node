create or replace view v_task_watchers as
select 
    w.task_id,
    w.user_id,
    u.name || ' ' || u.surname as user_name,
    r.name as role
from watchers w
left join users u on u.id = w.user_id
left join roles r on r.id = u.role_id;