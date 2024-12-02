create or replace view v_profiles as
    select u.id, 
           u.login,
           u.name, 
           u.surname,  
           u.email, 
           u.role,
           u.created_on, 
           u.last_login,
           tu.total_tasks,
           pu.total_projects
    from v_users u
    left join v_task_per_user tu on tu.assignee_id = u.id
    left join v_projects_per_user pu on pu.user_id = u.id;