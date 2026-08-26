create or replace function update_role(
    p_id smallint,
    p_name character varying,
    p_description text,
    p_active boolean,
    p_permissions smallint[]
) returns void as $function$

    declare
        v_permissions smallint[] := coalesce(p_permissions, '{}'::smallint[]);

begin

    -- Serialise concurrent edits of the same role: without this, two callers
    -- interleave their delete/insert and the loser's permissions survive.
    perform 1 from roles where id = p_id for update;
    if not found then
        raise exception 'Role % does not exist', p_id using errcode = 'no_data_found';
    end if;

    update roles
    set (name, description, active)
        = (p_name, p_description, p_active)
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
