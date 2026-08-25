create or replace function is_admin(user_id integer)
returns boolean as $function$
declare is_admin boolean;
begin
    select exists (
        select 1 from users u
        where u.id = user_id and u.role_id = 1
    ) into is_admin;
    return is_admin;
end;
$function$ language plpgsql;