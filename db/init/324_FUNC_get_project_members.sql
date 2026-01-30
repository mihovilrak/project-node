create or replace function get_project_members(p_project_id int)
returns table (
    project_id int,
    user_id int,
    name varchar,
    surname varchar,
    role varchar
) as $$
begin
    return query
    select
        pu.project_id,
        u.id as user_id,
        u.name,
        u.surname,
        r.name as role
    from project_users pu
    join users u on u.id = pu.user_id
    join roles r on r.id = u.role_id
    where pu.project_id = p_project_id;
end;
$$ language plpgsql;
