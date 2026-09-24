create or replace function update_role(
    p_id smallint,
    p_name character varying,
    p_description text,
    p_active boolean,
    p_permissions smallint[]
) returns void as $function$

    declare
        v_permissions smallint[] := coalesce(p_permissions, '{}'::smallint[]);
        v_current_name roles.name%type;

begin

    -- Serialise concurrent edits of the same role: without this, two callers
    -- interleave their delete/insert and the loser's permissions survive.
    select name into v_current_name from roles where id = p_id for update;
    if not found then
        raise exception 'Role % does not exist', p_id using errcode = 'no_data_found';
    end if;

    -- The seeded Admin role is the way back in; it must stay usable.
    if v_current_name = 'Admin' and (
        p_name is distinct from 'Admin'
        or p_active is false
        or not exists (
            select 1 from permissions
            where name = 'Admin' and id = any(v_permissions)
        )
    ) then
        raise exception 'The Admin role cannot be renamed, deactivated or lose the Admin permission'
            using errcode = 'insufficient_privilege';
    end if;

    update roles
    set (name, description, active)
        = (p_name, p_description, coalesce(p_active, active))
    where id = p_id;

    -- Differential update rather than delete-all/insert-all, so a permission
    -- the role keeps is never momentarily absent.
    delete from roles_permissions
    where role_id = p_id
    and permission_id <> all(v_permissions);

    insert into roles_permissions (role_id, permission_id)
    select p_id, unnest(v_permissions)
    on conflict do nothing;

end;

$function$ language plpgsql;
