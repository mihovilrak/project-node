create or replace function user_notifications(u_id integer)
returns table (
    id integer,
    user_id integer,
    type_id integer,
    title character varying,
    message text,
    link character varying,
    is_read boolean,
    active boolean,
    read_on timestamp with time zone,
    created_on timestamp with time zone,
    type character varying,
    icon character varying,
    color character varying
) as $$
begin
    return query
        SELECT n.*, 
        nt.name as type, 
        nt.icon, 
        nt.color 
       FROM notifications n
       JOIN notification_types nt ON n.type_id = nt.id
       WHERE n.user_id = u_id AND n.active = true
       ORDER BY n.created_on DESC;
end;
$$ language plpgsql;