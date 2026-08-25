create or replace function get_project_progress(p_project_id int)
returns table (
    id int,
    progress integer
) as $function$

begin

    return query
    select
        p_project_id as id,
        coalesce(
            (select round(avg(t.progress))::integer from tasks t where t.project_id = p_project_id),
            0
        )::integer as progress;

end;

$function$ language plpgsql;
