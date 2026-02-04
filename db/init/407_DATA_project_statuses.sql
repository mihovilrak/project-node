insert into project_statuses (name, color) values
    ('Active', '#4CAF50'),
    ('Inactive', '#9E9E9E'),
    ('Deleted', '#F44336')
    on conflict (name) do update set color = excluded.color;