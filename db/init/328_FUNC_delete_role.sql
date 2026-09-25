create or replace function delete_role(p_id smallint)
returns boolean as $function$
declare
    v_name roles.name%type;
begin
    select name into v_name from roles where id = p_id for update;
    if not found then
        return false;
    end if;

    if v_name = 'Admin' then
        raise exception 'The Admin role cannot be deleted'
            using errcode = 'insufficient_privilege';
    end if;

    delete from roles_permissions where role_id = p_id;
    delete from roles where id = p_id;
    return true;
end;
$function$ language plpgsql;
