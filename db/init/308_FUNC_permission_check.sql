create or replace function permission_check(
    user_id integer,
    required_permission character varying
)
returns boolean as $$
declare p_check boolean;
begin

    select exists (
        select 1 
        from get_user_permissions(user_id) 
        where permission = required_permission 
    ) into p_check;

    return p_check;
end;
$$ language plpgsql;