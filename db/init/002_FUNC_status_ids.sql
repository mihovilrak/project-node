create or replace function task_status_id(p_name text)
returns smallint
language sql
immutable
strict
as $$
    select case lower(p_name)
        when 'new' then 1
        when 'in_progress' then 2
        when 'on_hold' then 3
        when 'review' then 4
        when 'done' then 5
        when 'cancelled' then 6
        when 'deleted' then 7
    end::smallint;
$$;

create or replace function project_status_id(p_name text)
returns smallint
language sql
immutable
strict
as $$
    select case lower(p_name)
        when 'active' then 1
        when 'inactive' then 2
        when 'deleted' then 3
    end::smallint;
$$;

create or replace function user_status_id(p_name text)
returns smallint
language sql
immutable
strict
as $$
    select case lower(p_name)
        when 'active' then 1
        when 'inactive' then 2
        when 'deleted' then 3
    end::smallint;
$$;
