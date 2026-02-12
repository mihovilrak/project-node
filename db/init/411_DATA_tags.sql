insert into tags (name, color, icon) values
    ('Frontend', '#e91e63', 'Web'),
    ('Backend', '#2196f3', 'Storage'),
    ('Database', '#ff9800', 'Database'),
    ('UI/UX', '#9c27b0', 'Palette'),
    ('API', '#4caf50', 'Api'),
    ('Security', '#f44336', 'Security'),
    ('Performance', '#ff5722', 'Speed'),
    ('DevOps', '#795548', 'Settings')
    on conflict (name) do nothing;