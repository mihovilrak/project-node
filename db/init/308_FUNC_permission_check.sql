-- The 'Admin' permission implies every other permission.
-- Inactive users and roles hold nothing.
create or replace function permission_check(
    user_id integer,
    required_permission character varying
)
returns boolean as $function$
    select exists (
        select 1
        from users u
        join roles r on r.id = u.role_id and r.active
        join roles_permissions rp on rp.role_id = u.role_id
        join permissions p on p.id = rp.permission_id
        where u.id = $1
        and u.status_id = user_status_id('active')
        and p.name in ('Admin', $2)
    );
$function$ language sql stable;
