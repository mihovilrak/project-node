create or replace function get_notifications_for_service(p_limit int)
returns table (
    id int,
    user_id int,
    type_id smallint,
    title varchar,
    message text,
    link varchar,
    data jsonb,
    is_read boolean,
    active boolean,
    read_on timestamptz,
    created_on timestamptz,
    email varchar,
    login varchar
) as $function$

begin

    return query
    select
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
        u.email,
        u.login
    from notifications n
    join users u on u.id = n.user_id
    where n.created_on > now() - interval '5 minutes'
    and n.active = true
    and not exists (
        select 1 from notifications n2
        where n2.id = n.id
        and n2.read_on is not null
    )
    for update of n skip locked
    limit p_limit;

end;

$function$ language plpgsql;
