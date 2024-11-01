create or replace view v_subprojects as
select 
    p.*,
    ps.status,
    u.name as created_by_name,
    parent.name as parent_name
from projects p
left join project_statuses ps on ps.id = p.status_id
left join users u on u.id = p.created_by
left join projects parent on parent.id = p.parent_id
where p.parent_id is not null; 