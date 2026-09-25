create or replace function recent_projects(p_user_id integer)
returns table(
    id integer,
    name character varying,
    due_date date,
    progress integer
) as $function$
    select p.id,
        p.name,
        p.due_date,
        coalesce((
            select round(avg(t.progress))
            from tasks t
            where t.project_id = p.id
              and t.status_id <> task_status_id('deleted')
        ), 0)::integer
    from projects p
    join project_users pu on p.id = pu.project_id
    where pu.user_id = p_user_id
      and p.status_id = project_status_id('active')
    order by p.created_on desc
    limit 10;
$function$ language sql stable;
