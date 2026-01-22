insert into project_statuses(name) values
    ('Active'),
    ('Inactive'),
    ('Deleted')
    on conflict (name) do nothing;