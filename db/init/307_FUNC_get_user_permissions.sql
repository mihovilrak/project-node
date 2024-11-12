create or replace function get_user_permissions(user_id integer)
returns table(permission character varying) as $$
begin
    return query 
    select distinct p.permission 
    from users u
    join roles_permissions rp on u.role_id = rp.role_id
    join permissions p on rp.permission_id = p.id
    where u.id = user_id
    or u.role_id = 1;
end;
$$ language plpgsql;