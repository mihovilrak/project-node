CREATE OR REPLACE FUNCTION create_project_member_notifications(
    p_project_id integer,
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
    data jsonb,
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
    WITH project_info AS (
        SELECT
            p.name as project_name,
            p.description,
            u.name as action_user_name,
            nt.name as type_name
        FROM projects p
        JOIN users u ON u.id = p_action_user_id
        JOIN notification_types nt ON nt.id = p_type_id
        WHERE p.id = p_project_id
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
        pu.user_id,
        p_type_id,
        CASE p_type_id
            WHEN 6 THEN 'Project Updated'
            WHEN 8 THEN 'Added to Project'
            ELSE 'Project Notification'
        END,
        action_user_name || ' ' ||
        CASE p_type_id
            WHEN 6 THEN 'updated'
            WHEN 8 THEN 'added to'
            ELSE 'modified'
        END ||
        ' project "' || project_name || '"',
        '/projects/' || p_project_id,
        false,
        true,
        CURRENT_TIMESTAMP
    FROM project_users pu
    CROSS JOIN project_info
    WHERE pu.project_id = p_project_id
    AND pu.user_id != p_action_user_id
    RETURNING *;
END;
$$ LANGUAGE plpgsql;
