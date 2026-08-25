create or replace function get_user_by_id(p_id int)
returns table (
    id int,
    login varchar,
    name varchar,
    surname varchar,
    email varchar,
    role_id smallint,
    status_id smallint,
    status_name varchar,
    role_name varchar,
    created_on timestamp with time zone,
    updated_on timestamp with time zone,
    last_login timestamp with time zone
) as $function$

begin

    return query
    select
        u.id,
        u.login,
        u.name,
        u.surname,
        u.email,
        u.role_id,
        u.status_id,
        s.name as status_name,
        r.name as role_name,
        date_trunc('second', u.created_on) as created_on,
        date_trunc('second', u.updated_on) as updated_on,
        date_trunc('second', l.logged_on) as last_login
    from users u
    left join user_statuses s on s.id = u.status_id
    left join roles r on r.id = u.role_id
    left join lateral (
        select al.user_id, al.logged_on
        from app_logins al
        where al.user_id = u.id
        order by al.logged_on desc
        limit 1
    ) l on true
    where u.status_id != 3
    and u.id = p_id;

end;

$function$ language plpgsql;
