create or replace function add_task_tags(
    p_task_id integer,
    p_tag_ids smallint[]
) returns void as $function$
begin

    -- Insert tags
    insert into task_tags
    (task_id, tag_id)
    values
    (p_task_id, unnest(p_tag_ids))
    on conflict (task_id, tag_id) do nothing;

end;

$function$ language plpgsql;