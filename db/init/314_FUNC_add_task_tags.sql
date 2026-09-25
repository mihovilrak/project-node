-- Inactive or unknown tag ids are ignored.
create or replace function add_task_tags(
    p_task_id integer,
    p_tag_ids smallint[]
) returns void as $function$
    insert into task_tags (task_id, tag_id)
    select p_task_id, t.id
    from tags t
    where t.id = any(p_tag_ids)
    and t.active
    on conflict (task_id, tag_id) do nothing;
$function$ language sql;
