create or replace function create_notification(
    p_user_id integer,
    p_type_id integer,
    p_title varchar(100),
    p_message text,
    p_link varchar(255)
) returns void as $$
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
    ) values (
        p_user_id,
        p_type_id,
        p_title,
        p_message,
        p_link,
        false,
        true,
        current_timestamp
    );
end;
$$ language plpgsql;