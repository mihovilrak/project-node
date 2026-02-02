create or replace function recent_projects(p_user_id integer)
returns table(
    id integer,
    name character varying,
    due_date date,
    progress integer
) as $$
begin
    return query
        select p.id,
               p.name,
               p.due_date,
               vp.progress::integer
        from projects p
        join project_users pu on p.id = pu.project_id
        join lateral get_project_progress(p.id) vp on true
        where pu.user_id = p_user_id
        and p.status_id = 1
        order by p.created_on desc
        limit 10;
end;
$$ language plpgsql;