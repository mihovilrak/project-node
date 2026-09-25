create or replace function create_notification(
    p_user_id integer,
    p_type_id smallint,
    p_title varchar(100),
    p_message text,
    p_link varchar(255)
) returns void as $function$

begin

    insert into notifications (
        user_id,
        type_id,
        title,
        message,
        link,
        is_read,
        active,
        created_on
    )
    -- notifications_enabled = false turns off both in-app and email delivery.
    select
        p_user_id,
        p_type_id,
        p_title,
        p_message,
        p_link,
        false,
        true,
        current_timestamp
    where not exists (
        select 1
        from user_settings s
        where s.user_id = p_user_id
        and not s.notifications_enabled
    );

end;

$function$ language plpgsql;