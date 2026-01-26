create or replace view v_user_total_hours as
    select user_id,
           coalesce(sum(spent_time), 0) as total_hours
    from time_logs
    group by user_id;
