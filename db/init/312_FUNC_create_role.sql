create or replace function create_role(
    p_name character varying,
    p_description text,
    p_active boolean,
    p_permissions integer[]
) returns integer as $$

    declare
        v_role_id integer;

    begin
        -- Insert role
        insert into roles (name, description, active)
        values (p_name, p_description, p_active)
        returning id into v_role_id;

        -- Insert permissions
        insert into roles_permissions (role_id, permission_id)
        values (v_role_id, unnest(p_permissions));

        return v_role_id;
    end;
$$ language plpgsql;

