create or replace function get_subprojects(p_parent_id int)
returns table (
    id int,
    name varchar,
    description text,
    start_date date,
    end_date date,
    due_date date,
    parent_id int,
    status_id smallint,
    created_by int,
    created_on timestamptz,
    updated_on timestamptz,
    status varchar,
    created_by_name varchar,
    parent_name varchar
) as $function$

begin

    return query
    select
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
        p.updated_on,
        ps.name as status,
        u.name as created_by_name,
        parent.name as parent_name
    from projects p
    left join project_statuses ps on ps.id = p.status_id
    left join users u on u.id = p.created_by
    left join projects parent on parent.id = p.parent_id
    where p.parent_id is not null
    and p.parent_id = p_parent_id;

end;

$function$ language plpgsql;
