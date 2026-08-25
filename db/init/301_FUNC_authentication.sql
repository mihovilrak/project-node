create or replace function authentication (
    auth_login character varying,
    auth_password character varying
)
returns table (
    id integer,
    login character varying,
    role_id smallint
) as $function$

begin
    return query
    select u.id,
        u.login,
        u.role_id
    from users u
    where u.login = auth_login
    and u.password = crypt(auth_password, u.password);
end;

$function$ language plpgsql;
