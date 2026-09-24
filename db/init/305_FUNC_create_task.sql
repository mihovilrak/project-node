-- Membership means a project_users row or having created the project, as in
-- api/src/models/accessModel.ts.
create or replace function is_project_member(p_project_id integer, p_user_id integer)
returns boolean as $function$
    select exists (
        select 1 from projects p
        where p.id = p_project_id
          and (p.created_by = p_user_id
               or exists (select 1 from project_users pu
                          where pu.project_id = p.id and pu.user_id = p_user_id))
    );
$function$ language sql stable;

create or replace function create_task(
    p_name character varying,
    p_description text,
    p_estimated_time numeric,
    p_start_date date,
    p_due_date date,
    p_priority_id smallint,
    p_status_id smallint,
    p_type_id smallint,
    p_parent_id integer,
    p_project_id integer,
    p_holder_id integer,
    p_assignee_id integer,
    p_created_by integer,
    p_tag_ids smallint[],
    p_watchers integer[]
) returns table(
    task_id integer
) as $function$

    declare
        v_task_id integer;

    begin
        -- holder_id / assignee_id are nullable in tasks, so an unassigned task is legal input.
        if p_name is null or p_start_date is null or p_due_date is null
           or p_priority_id is null or p_status_id is null or p_type_id is null
           or p_project_id is null or p_created_by is null then
            raise exception 'create_task: name, start_date, due_date, priority_id, status_id, type_id, project_id and created_by are required'
                using errcode = 'invalid_parameter_value';
        end if;

        -- The creator already passed the API's project access check (member or Admin).
        if exists (
            select 1
            from unnest(array[p_holder_id, p_assignee_id] || coalesce(p_watchers, '{}')) as u(id)
            where u.id is not null
              and u.id <> p_created_by
              and not is_project_member(p_project_id, u.id)
        ) then
            raise exception 'create_task: holder, assignee and watchers must be project members'
                using errcode = 'invalid_parameter_value';
        end if;

        if p_parent_id is not null and not exists (
            select 1 from tasks where id = p_parent_id and project_id = p_project_id
        ) then
            raise exception 'create_task: parent task must belong to the same project'
                using errcode = 'invalid_parameter_value';
        end if;

        insert into tasks (
            name,
            description,
            estimated_time,
            start_date,
            due_date,
            priority_id,
            status_id,
            type_id,
            parent_id,
            project_id,
            holder_id,
            assignee_id,
            created_by
        ) values (
            p_name,
            p_description,
            p_estimated_time,
            p_start_date,
            p_due_date,
            p_priority_id,
            p_status_id,
            p_type_id,
            p_parent_id,
            p_project_id,
            p_holder_id,
            p_assignee_id,
            p_created_by
        ) returning id into v_task_id;

        if p_tag_ids is not null then
            insert into task_tags (task_id, tag_id)
            values (v_task_id, unnest(p_tag_ids));
        end if;

        if p_watchers is not null then
            insert into watchers (task_id, user_id)
            values (v_task_id, unnest(p_watchers));
        end if;

        return query
        select v_task_id;
    end;

$function$ language plpgsql;
