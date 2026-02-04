insert into task_statuses (name, color) values
    ('New', '#2196F3'),
    ('In Progress', '#FF9800'),
    ('On Hold', '#9E9E9E'),
    ('Review', '#9C27B0'),
    ('Done', '#4CAF50'),
    ('Cancelled', '#757575'),
    ('Deleted', '#F44336')
    on conflict (name) do update set color = excluded.color;