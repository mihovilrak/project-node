create or replace view v_active_tasks as
    select * from v_tasks
    where status not in ('Done', 'Cancelled', 'Deleted')
    and assignee_id is not null;