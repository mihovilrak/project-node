create or replace view v_notification_service as
select  n.*, 
        u.email, 
        u.login 
from notifications n
join users u on u.id = n.user_id
where n.created_on > now() - interval '5 minutes'
and n.active = true
and not exists (
    select 1 from notifications n2
    where n2.id = n.id
    and n2.read_on is not null
)
for update skip locked;