create or replace view v_project_members as
select 
    pu.project_id,
    u.id as user_id,
    u.name,
    u.surname,
    r.name as role
from project_users pu
join users u on u.id = pu.user_id
join roles r on r.id = u.role_id; 