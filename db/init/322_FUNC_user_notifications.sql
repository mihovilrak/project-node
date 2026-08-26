-- Return type changed; replace cannot alter it, so drop first.
drop function if exists user_notifications(integer);

create or replace function user_notifications(u_id integer)
returns table (
    id integer,
    user_id integer,
    type_id smallint,
    title character varying,
    message text,
    link character varying,
    data jsonb,
    is_read boolean,
    active boolean,
    read_on timestamp with time zone,
    created_on timestamp with time zone,
    type character varying,
    icon character varying,
    color character varying
) as $function$

begin

    -- Columns listed explicitly so the row type cannot drift from the table.
    return query
        SELECT
            n.id,
            n.user_id,
            n.type_id,
            n.title,
            n.message,
            n.link,
            n.data,
            n.is_read,
            n.active,
            n.read_on,
            n.created_on,
            nt.name as type,
            nt.icon,
            nt.color
       FROM notifications n
       JOIN notification_types nt ON n.type_id = nt.id
       WHERE n.user_id = u_id AND n.active = true
       ORDER BY n.created_on DESC;

end;

$function$ language plpgsql;
