create or replace function project_details(
    proj_id integer
)
returns table (
    id integer,
    name character varying,
    description text,
    start_date date,
    end_date date,
    due_date date,
    parent_id integer,
    parent_name character varying,
    status_id smallint,
    status_name character varying,
    created_by integer,
    created_by_name character varying,
    created_on timestamptz,
    estimated_time numeric,
    spent_time numeric,
    progress numeric
) as $function$
    select p.id,
        p.name,
        p.description,
        p.start_date,
        p.end_date,
        p.due_date,
        p.parent_id,
        pt.name,
        p.status_id,
        ps.name,
        p.created_by,
        u.name,
        p.created_on,
        coalesce(st.estimated_time, 0),
        coalesce(st.spent_time, 0),
        coalesce(st.progress, 0)::numeric
    from projects p
    left join projects pt on pt.id = p.parent_id
    left join project_statuses ps on ps.id = p.status_id
    left join users u on u.id = p.created_by
    left join lateral (
        select
            sum(t.estimated_time) as estimated_time,
            sum((select sum(l.spent_time) from time_logs l where l.task_id = t.id)) as spent_time,
            round(avg(t.progress)) as progress
        from tasks t
        where t.project_id = p.id
          and t.status_id <> task_status_id('deleted')
    ) st on true
    where p.id = proj_id;
$function$ language sql stable;
