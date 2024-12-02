create or replace view v_project_spent_time as
select 
    t.project_id,
    sum(tl.spent_time) as spent_time
from time_logs tl
join tasks t on tl.task_id = t.id
group by t.project_id;