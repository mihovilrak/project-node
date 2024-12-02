create or replace view v_projects_per_user as
    select pu.user_id,
           count(*) as total_projects
    from project_users pu
    join projects p on pu.project_id = p.id
    where p.status_id = 1
    group by pu.user_id;