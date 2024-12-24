create or replace view v_parent_tasks as
    select pt.id,
           pt.name
    from tasks t
    right join tasks pt on pt.id = t.parent_id
    where t.parent_id is not null;

