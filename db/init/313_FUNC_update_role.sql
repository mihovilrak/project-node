create or replace function update_role(
    p_id smallint,
    p_name character varying,
    p_description text,
    p_active boolean,
    p_permissions smallint[]
) returns void as $function$

    declare
        p_permission smallint;

begin

    -- Update role
    update roles
    set (name, description, active)
        = (p_name, p_description, p_active)
    where id = p_id;

    -- Delete existing permissions
    delete from roles_permissions where role_id = p_id;

    -- Insert new permissions
    if p_permissions is not null then
            insert into roles_permissions
            (role_id, permission_id)
            values
            (p_id, unnest(p_permissions));
    end if;

end;

$function$ language plpgsql;