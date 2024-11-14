insert into priorities (priority) values
    ('Low/Wont'),
    ('Normal/Could'),
    ('High/Should'),
    ('Very high/Must'),
    ('Urgent/ASAP')
    on conflict (priority) do nothing;