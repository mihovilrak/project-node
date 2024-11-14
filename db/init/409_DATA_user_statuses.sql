insert into user_statuses(status) values 
    ('Active'),
    ('Inactive'),
    ('Deleted')
    on conflict (status) do nothing;