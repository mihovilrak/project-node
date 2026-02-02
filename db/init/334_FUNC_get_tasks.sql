create or replace function get_tasks(
    p_id int default null,
    p_project_id int default null,
    p_assignee_id int default null,
    p_holder_id int default null,
    p_status_id int default null,
    p_priority_id int default null,
    p_type_id int default null,
    p_parent_id int default null,
    p_active_statuses_only boolean default false,
    p_created_by int default null,
    p_due_date_from date default null,
    p_due_date_to date default null,
    p_start_date_from date default null,
    p_start_date_to date default null,
    p_created_from date default null,
    p_created_to date default null,
    p_estimated_time_min numeric default null,
    p_estimated_time_max numeric default null,
    p_inactive_statuses_only boolean default false
)
returns table (
    id int,
    name varchar,
    project_id int,
    project_name varchar,
    holder_id int,
    holder_name varchar,
    assignee_id int,
    assignee_name varchar,
    parent_id int,
    parent_name varchar,
    description text,
    type_id int,
    type_name varchar,
    type_color varchar,
    type_icon varchar,
    status_id int,
    status_name varchar,
    priority_name varchar,
    priority_color varchar,
    start_date date,
    due_date date,
    end_date date,
    spent_time numeric,
    progress int,
    created_by int,
    created_by_name varchar,
    created_on timestamp(0),
    estimated_time numeric
) as $$
begin
    return query
    select
        t.id,
        t.name,
        t.project_id,
        po.name as project_name,
        t.holder_id,
        h.name as holder_name,
        t.assignee_id,
        a.name as assignee_name,
        t.parent_id,
        pt.name as parent_name,
        t.description,
        t.type_id,
        tt.name as type_name,
        tt.color as type_color,
        tt.icon as type_icon,
        t.status_id,
        ts.name as status_name,
        pi.name as priority_name,
        pi.color as priority_color,
        t.start_date,
        t.due_date,
        t.end_date,
        tst.spent_time,
        t.progress,
        t.created_by,
        c.name as created_by_name,
        t.created_on::timestamp(0),
        t.estimated_time
    from tasks t
    left join projects po on po.id = t.project_id
    left join users h on h.id = t.holder_id
    left join users a on a.id = t.assignee_id
    left join users c on c.id = t.created_by
    left join task_types tt on tt.id = t.type_id
    left join task_statuses ts on ts.id = t.status_id
    left join priorities pi on pi.id = t.priority_id
    left join (
        select distinct pt.id, pt.name
        from tasks t2
        join tasks pt on pt.id = t2.parent_id
        where t2.parent_id is not null
    ) pt on pt.id = t.parent_id
    left join (
        select tl.task_id, sum(tl.spent_time)::numeric as spent_time
        from time_logs tl
        group by tl.task_id
    ) tst on tst.task_id = t.id
    where (p_id is null or t.id = p_id)
    and (p_project_id is null or t.project_id = p_project_id)
    and (p_assignee_id is null or t.assignee_id = p_assignee_id)
    and (p_holder_id is null or t.holder_id = p_holder_id)
    and (p_status_id is null or t.status_id = p_status_id)
    and (p_priority_id is null or t.priority_id = p_priority_id)
    and (p_type_id is null or t.type_id = p_type_id)
    and (p_parent_id is null or t.parent_id = p_parent_id)
    and (
      (p_inactive_statuses_only and t.status_id in (5, 6, 7))
      or (not p_inactive_statuses_only and (not p_active_statuses_only or t.status_id in (1, 2, 3, 4)))
    )
    and (p_created_by is null or t.created_by = p_created_by)
    and (p_due_date_from is null or t.due_date >= p_due_date_from)
    and (p_due_date_to is null or t.due_date <= p_due_date_to)
    and (p_start_date_from is null or t.start_date >= p_start_date_from)
    and (p_start_date_to is null or t.start_date <= p_start_date_to)
    and (p_created_from is null or t.created_on::date >= p_created_from)
    and (p_created_to is null or t.created_on::date <= p_created_to)
    and (p_estimated_time_min is null or t.estimated_time >= p_estimated_time_min)
    and (p_estimated_time_max is null or t.estimated_time <= p_estimated_time_max);
end;
$$ language plpgsql;
