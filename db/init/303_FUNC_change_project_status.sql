-- The 1-argument toggle this replaces; dropped so no caller can resolve to it.
drop function if exists change_project_status(integer);

create or replace function change_project_status(project_id integer, new_status_id integer)
returns table(message text) as $function$
    declare
        project_name text;
        status_name text;
    begin

        select ps.name into status_name
        from project_statuses ps
        where ps.id = new_status_id;

        if status_name is null then
            raise exception 'Unknown project status id: %', new_status_id
                using errcode = 'foreign_key_violation';
        end if;

        update projects p
        set (status_id, updated_on) = (new_status_id, current_timestamp)
        where p.id = project_id
        returning p.name into project_name;

        -- No row updated: the caller gets an empty result and maps it to a 404.
        if project_name is null then
            return;
        end if;

        return query
            select concat(
                'Project status changed to ',
                lower(status_name),
                ' for project ',
                project_name,
                '.'
            ) as message;

    end;
$function$ language plpgsql;
