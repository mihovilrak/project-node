create or replace function task_notification_trigger() returns trigger as $$
declare
    v_type_id integer;
begin
    -- Task Due Soon
    if (TG_OP = 'INSERT' or NEW.due_date <> OLD.due_date) and 
       NEW.due_date between now() and now() + interval '24 hours' and
       NEW.status_id NOT IN (5, 6, 7) then
        select id into v_type_id from notification_types where name = 'Task Due Soon';
        perform create_notification(
            NEW.assignee_id,
            v_type_id,
            'Task Due Soon',
            'Task ' || NEW.name || ' is due ' || NEW.due_date::text,
            '/tasks/' || NEW.id
        );
    end if;

    -- Task Assigned
    if (TG_OP = 'UPDATE' and NEW.assignee_id IS NOT NULL and 
        (OLD.assignee_id IS NULL or NEW.assignee_id <> OLD.assignee_id)) then
        select id into v_type_id from notification_types where name = 'Task Assigned';
        perform create_notification(
            NEW.assignee_id,
            v_type_id,
            'Task Assigned',
            'You have been assigned to task: ' || NEW.name,
            '/tasks/' || NEW.id
        );
    end if;

    -- Task Status Updated
    if TG_OP = 'UPDATE' and NEW.status_id <> OLD.status_id then
        select id into v_type_id from notification_types where name = 'Task Updated';
        perform create_notification(
            NEW.assignee_id,
            v_type_id,
            'Task Status Updated',
            'Task ' || NEW.name || ' status has been updated',
            '/tasks/' || NEW.id
        );
    end if;

    -- Task Completed
    if TG_OP = 'UPDATE' and NEW.status_id = 5 and OLD.status_id <> 5 then
        select id into v_type_id from notification_types where name = 'Task Completed';
        perform create_notification(
            NEW.created_by,
            v_type_id,
            'Task Completed',
            'Task ' || NEW.name || ' has been completed',
            '/tasks/' || NEW.id
        );
    end if;

    return NEW;
end;
$$ language plpgsql;

create or replace trigger task_notifications
    after insert or update on tasks
    for each row
    execute function task_notification_trigger();