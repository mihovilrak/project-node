create or replace function change_project_status(project_id integer) returns table(message text) as $$
    begin

        -- Update the active status of the given project 
        update projects 
        set status_id = case 
                        when status_id = 1 then 2 
                        when status_id = 2 then 1
                     end 
        where id = $1;

        -- Return message query
        return query
            select concat(
                'Project status changed to ', 
                case 
                    when status_id = 1 then 'active' 
                    when status_id = 2 then 'inactive' 
                end,
                ' for project ', 
                name,
                '.'
            ) as message
            from projects 
            where id = $1;

    end;
$$ language plpgsql;