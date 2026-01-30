create or replace function projects_for_user(user_id integer)
returns table(
    id integer,
    name character varying,
    description text,
    start_date date,
    end_date date,
    due_date date,
    status_id integer,
    created_by integer,
    created_on timestamptz
) as $$

begin
    return query
    select p.*
    from projects p
    left join project_users pu on pu.project_id = p.id
    where (pu.user_id = $1 or p.created_by = $1)
    and p.status_id != 3;
end;

$$ language plpgsql;