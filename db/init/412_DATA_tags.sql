insert into tags (name, color) values 
    ('Frontend', '#e91e63'),
    ('Backend', '#2196f3'),
    ('Database', '#ff9800'),
    ('UI/UX', '#9c27b0'),
    ('API', '#4caf50'),
    ('Security', '#f44336'),
    ('Performance', '#ff5722'),
    ('DevOps', '#795548')
    on conflict (name) do nothing;