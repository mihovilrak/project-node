create or replace function get_user_permissions(user_id integer)
returns table(permission character varying) as $$
begin
    -- If user is admin, return all possible permissions
    if (select is_admin(user_id)) then
        return query 
        select p.name as permission
        from permissions p;
    end if;

    -- If not admin, return only assigned permissions
    return query 
    select distinct p.name as permission 
    from users u
    join roles_permissions rp on u.role_id = rp.role_id
    join permissions p on rp.permission_id = p.id
    where u.id = user_id;
end;
$$ language plpgsql;