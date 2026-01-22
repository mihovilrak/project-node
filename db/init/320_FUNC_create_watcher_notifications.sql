CREATE OR REPLACE FUNCTION create_watcher_notifications(
    p_task_id integer,
    p_action_user_id integer,
    p_type_id integer
)
RETURNS TABLE (
    id integer,
    user_id integer,
    type_id integer,
    title varchar(100),
    message text,
    link varchar(255),
    is_read boolean,
    active boolean,
    read_on timestamptz,
    created_on timestamptz
) AS $$
BEGIN
    -- Verify notification type exists
    IF NOT EXISTS (
        SELECT 1
        FROM notification_types notype
        WHERE notype.id = p_type_id
        ) THEN
        RAISE EXCEPTION 'Invalid notification type ID: %', p_type_id;
    END IF;

    RETURN QUERY
    WITH task_info AS (
        SELECT
            t.name as task_name,
            t.description,
            p.name as project_name,
            u.name as action_user_name,
            nt.name as type_name
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        JOIN users u ON u.id = p_action_user_id
        JOIN notification_types nt ON nt.id = p_type_id
        WHERE t.id = p_task_id
    )
    INSERT INTO notifications (
        user_id,
        type_id,
        title,
        message,
        link,
        is_read,
        active,
        created_on
    )
    SELECT
        w.user_id,
        p_type_id,
        CASE p_type_id
            WHEN 3 THEN 'Task Updated'
            WHEN 4 THEN 'New Comment'
            WHEN 5 THEN 'Status Changed'
            ELSE 'Task Notification'
        END,
        action_user_name || ' ' ||
        CASE p_type_id
            WHEN 3 THEN 'updated'
            WHEN 4 THEN 'commented on'
            WHEN 5 THEN 'changed status of'
            ELSE 'modified'
        END ||
        ' task "' || task_name || '" in project "' || project_name || '"',
        '/tasks/' || p_task_id,
        false,
        true,
        CURRENT_TIMESTAMP
    FROM watchers w
    CROSS JOIN task_info
    WHERE w.task_id = p_task_id
    AND w.user_id != p_action_user_id
    RETURNING *;
END;
$$ LANGUAGE plpgsql;