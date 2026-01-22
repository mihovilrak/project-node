create or replace function get_task_files(t_id integer)
returns table(
    id integer,
    task_id integer,
    user_id integer,
    original_name text,
    stored_name text,
    size bigint,
    mime_type character varying,
    file_path text,
    uploaded_on timestamp with time zone,
    uploaded_by text
) as $$
begin

    return query
    SELECT
      f.*,
      u.name || ' ' || u.surname as uploaded_by
    FROM files f
    LEFT JOIN users u ON f.user_id = u.id
    WHERE f.task_id = $1
    ORDER BY f.uploaded_on DESC;

end;
$$ language plpgsql;