create or replace function user_settings_insert()
returns trigger as $function$

begin

    insert into user_settings (user_id) values (NEW.id);
    return new;

end;

$function$ language plpgsql;

create or replace trigger trg_user_settings_insert
    after insert on users
    for each row
    execute function user_settings_insert();