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
        -- Validate required fields
        if p_name is null or p_start_date is null or p_due_date is null
           or p_priority_id is null or p_status_id is null or p_type_id is null
           or p_project_id is null or p_holder_id is null or p_assignee_id is null then
            return;
        end if;

        -- Insert the task and get the new ID
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

        -- Insert tags if provided
        if p_tag_ids is not null then
            insert into task_tags (task_id, tag_id)
            values (v_task_id, unnest(p_tag_ids));
        end if;

        -- Insert watchers
        if p_watchers is not null then
            insert into watchers (task_id, user_id)
            values (v_task_id, unnest(p_watchers));
        end if;

        -- Return just the ID
        return query
        select v_task_id;
    end;

$function$ language plpgsql;