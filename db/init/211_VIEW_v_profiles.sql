create or replace view v_profiles as
    select u.id,
           u.login,
           u.name,
           u.surname,
           u.email,
           u.role_name,
           u.created_on,
           u.last_login,
           coalesce(tu.total_tasks, 0) as total_tasks,
           coalesce(ct.completed_tasks, 0) as completed_tasks,
           coalesce(ap.active_projects, 0) as active_projects,
           coalesce(th.total_hours, 0) as total_hours
    from v_users u
    left join v_task_per_user tu on tu.assignee_id = u.id
    left join v_completed_tasks_per_user ct on ct.assignee_id = u.id
    left join v_active_projects_per_user ap on ap.user_id = u.id
    left join v_user_total_hours th on th.user_id = u.id;