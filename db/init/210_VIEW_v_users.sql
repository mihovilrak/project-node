create or replace view v_users as
    select  u.id,
            u.login,
            u.name,
            u.surname,
            u.email,
            s.status,
            r.role,
            u.created_on,
            u.updated_on,
            l.logged_on as last_login
    from users u
    left join user_statuses s on s.id = u.status_id
    left join roles r on r.id = u.role_id
    left join v_last_login l on l.user_id = u.id and l.login_rn = 1;