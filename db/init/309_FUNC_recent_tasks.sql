-- Only tasks in live projects the user still belongs to.
create or replace function recent_tasks(user_id integer)
returns table(
    id integer,
    name character varying,
    project_name character varying,
    holder_name character varying,
    estimated_time numeric,
    start_date date,
    due_date date,
    status_name character varying,
    priority_name character varying,
    created_by_name character varying,
    priority_color text
) as $function$
    select t.id,
        t.name,
        po.name,
        h.name,
        t.estimated_time,
        t.start_date,
        t.due_date,
        ts.name,
        pi.name,
        c.name,
        pi.color::text
    from tasks t
    join projects po on po.id = t.project_id
    left join users h on h.id = t.holder_id
    left join users c on c.id = t.created_by
    left join task_statuses ts on ts.id = t.status_id
    left join priorities pi on pi.id = t.priority_id
    where t.assignee_id = recent_tasks.user_id
      and t.status_id not in (
          task_status_id('deleted'), task_status_id('cancelled'), task_status_id('done')
      )
      and po.status_id <> project_status_id('deleted')
      and is_project_member(t.project_id, recent_tasks.user_id)
    order by t.created_on desc
    limit 10;
$function$ language sql stable;
