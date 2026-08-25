create or replace function get_system_stats()
returns table (
    active_users bigint,
    active_projects bigint,
    active_tasks bigint,
    time_logs_30d bigint
) as $function$

begin

    return query
    select
        (select count(*) from users where status_id != 3),
        (select count(*) from projects where status_id != 3),
        (select count(*) from tasks where status_id != 3),
        (select count(*) from time_logs where created_on >= now() - interval '30 days');

end;

$function$ language plpgsql;
