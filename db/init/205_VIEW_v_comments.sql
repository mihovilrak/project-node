create or replace view v_comments as 
    select  c.id,
            c.task_id,
            c.user_id,
            u.name || ' ' || u.surname as user_name,
            c.comment,
            c.created_on
    from comments c 
    left join users u on u.id = c.user_id
    where c.active = true
    order by 6 desc;