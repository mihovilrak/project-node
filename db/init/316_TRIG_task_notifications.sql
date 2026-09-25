-- Task Due Soon is not raised here: it depends on the calendar, not on a row
-- change, so create_due_soon_notifications() sweeps for it on a schedule.
create or replace function task_notification_trigger()
returns trigger as $function$

declare
    v_actor integer;
    v_assigned_id smallint;
    v_updated_id smallint;
    v_completed_id smallint;
    v_done_id constant smallint := task_status_id('done');

begin
    if NEW.assignee_id is not distinct from OLD.assignee_id
        and NEW.status_id is not distinct from OLD.status_id
    then
        return NEW;
    end if;

    -- The API sets app.user_id per transaction; people are not notified
    -- about their own changes.
    v_actor := nullif(current_setting('app.user_id', true), '')::integer;

    select
        max(id) filter (where name = 'Task Assigned'),
        max(id) filter (where name = 'Task Updated'),
        max(id) filter (where name = 'Task Completed')
    into v_assigned_id, v_updated_id, v_completed_id
    from notification_types
    where name in ('Task Assigned', 'Task Updated', 'Task Completed');

    if v_assigned_id is not null
        and NEW.assignee_id is not null
        and NEW.assignee_id is distinct from OLD.assignee_id
        and NEW.assignee_id is distinct from v_actor
    then
        perform create_notification(
            NEW.assignee_id,
            v_assigned_id,
            'Task Assigned',
            'You have been assigned to task: ' || NEW.name,
            '/tasks/' || NEW.id
        );
    end if;

    if v_updated_id is not null
        and NEW.status_id is distinct from OLD.status_id
        and NEW.assignee_id is not null
        and NEW.assignee_id is distinct from v_actor
    then
        perform create_notification(
            NEW.assignee_id,
            v_updated_id,
            'Task Status Updated',
            'Task ' || NEW.name || ' status has been updated',
            '/tasks/' || NEW.id
        );
    end if;

    if v_completed_id is not null
        and NEW.status_id = v_done_id
        and OLD.status_id is distinct from v_done_id
        and NEW.created_by is not null
        and NEW.created_by is distinct from v_actor
    then
        perform create_notification(
            NEW.created_by,
            v_completed_id,
            'Task Completed',
            'Task ' || NEW.name || ' has been completed',
            '/tasks/' || NEW.id
        );
    end if;

    -- No exception handler: a failing notification should abort the write
    -- rather than disappear into a warning nobody reads.
    return NEW;
end;
$function$ language plpgsql;

create or replace trigger task_notifications
    after update on tasks
    for each row
    execute function task_notification_trigger();
