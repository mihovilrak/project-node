drop function if exists get_project_progress(int);

-- Per-project task totals, ignoring deleted tasks. Plain SQL so a caller can
-- join it once instead of calling a function per project row.
create or replace function project_stats()
returns table (
    project_id int,
    estimated_time numeric,
    spent_time numeric,
    progress integer
) as $function$
    select
        t.project_id,
        coalesce(sum(t.estimated_time), 0)::numeric,
        coalesce(sum(tl.spent_time), 0)::numeric,
        coalesce(round(avg(t.progress)), 0)::integer
    from tasks t
    left join (
        select l.task_id, sum(l.spent_time) as spent_time
        from time_logs l
        group by l.task_id
    ) tl on tl.task_id = t.id
    where t.status_id <> task_status_id('deleted')
    group by t.project_id;
$function$ language sql stable;
