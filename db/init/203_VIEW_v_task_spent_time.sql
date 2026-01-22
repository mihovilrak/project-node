create or replace view v_task_spent_time as
select
    task_id,
    sum(spent_time) as spent_time
from time_logs
group by task_id;