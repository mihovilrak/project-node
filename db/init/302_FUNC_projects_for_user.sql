-- Return type changed; replace cannot alter it, so drop first.
drop function if exists projects_for_user(integer);

create or replace function projects_for_user(user_id integer)
returns table(
    id integer,
    name character varying,
    description text,
    start_date date,
    end_date date,
    due_date date,
    parent_id integer,
    status_id smallint,
    created_by integer,
    created_on timestamptz,
    updated_on timestamptz
) as $function$

begin
    -- Columns are listed explicitly: p.* drifts the moment a column is added
    -- and raises "structure of query does not match function result type".
    -- distinct: the or'd join matches twice for an owner who is also a member.
    return query
    select distinct
        p.id,
        p.name,
        p.description,
        p.start_date,
        p.end_date,
        p.due_date,
        p.parent_id,
        p.status_id,
        p.created_by,
        p.created_on,
        p.updated_on
    from projects p
    left join project_users pu on pu.project_id = p.id
    where (pu.user_id = $1 or p.created_by = $1)
    and p.status_id != 3;
end;

$function$ language plpgsql;
