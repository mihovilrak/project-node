create or replace view active_tasks as
    select * from v_tasks
    where status not in ('Deleted', 'Discarded')
    and assignee_id is not null;