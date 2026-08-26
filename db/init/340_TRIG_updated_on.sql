-- updated_on used to be written only by whichever UPDATE statement remembered
-- to set it, and defaulted to the creation time, so "has this row ever been
-- modified?" had no answer. It is now null until the first real change.
create or replace function set_updated_on()
returns trigger as $function$
begin
    NEW.updated_on := current_timestamp;
    return NEW;
end;
$function$ language plpgsql;

do $$
declare
    v_table text;
begin
    foreach v_table in array array[
        'users', 'projects', 'activity_types', 'task_types', 'tags',
        'tasks', 'time_logs', 'comments', 'app_settings', 'user_settings'
    ]
    loop
        execute format(
            'create or replace trigger %I_updated_on
                before update on %I
                for each row
                when (OLD.* is distinct from NEW.*)
                execute function set_updated_on()',
            v_table, v_table
        );
    end loop;
end;
$$;
