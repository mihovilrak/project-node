-- plpgsql -> sql keeps the signature, so replace is enough.
-- 'Admin' implies every permission. Inactive users and roles get none.
create or replace function get_user_permissions(user_id integer)
returns table(permission character varying) as $function$
    with granted as (
        select p.name
        from users u
        join roles r on r.id = u.role_id and r.active
        join roles_permissions rp on rp.role_id = u.role_id
        join permissions p on p.id = rp.permission_id
        where u.id = $1
        and u.status_id = user_status_id('active')
    )
    select p.name
    from permissions p
    where exists (select 1 from granted g where g.name = 'Admin')
    union
    select g.name from granted g;
$function$ language sql stable;
