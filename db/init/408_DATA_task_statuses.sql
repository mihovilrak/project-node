insert into task_statuses (name) values
    ('New'),
    ('In Progress'),
    ('On Hold'),
    ('Review'),
    ('Done'),
    ('Cancelled'),
    ('Deleted')
    on conflict (name) do nothing;