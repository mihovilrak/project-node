create or replace function authentication (
    auth_login character varying,
    auth_password character varying
)
returns table (
    id integer,
    login character varying,
    role_id smallint
) as $function$
declare
    v_id integer;
    v_login character varying;
    v_role_id smallint;
    v_hash character varying;
begin
    select u.id, u.login, u.role_id, u.password
    into v_id, v_login, v_role_id, v_hash
    from users u
    where u.login = auth_login
    and u.status_id = user_status_id('active');

    if not found then
        -- Hash anyway so an unknown login takes as long as a wrong password.
        perform crypt(auth_password, gen_salt('bf', 12));
        return;
    end if;

    if v_hash = crypt(auth_password, v_hash) then
        return query select v_id, v_login, v_role_id;
    end if;
end;

$function$ language plpgsql;
