insert into priorities (name) values
    ('Low/Wont'),
    ('Normal/Could'),
    ('High/Should'),
    ('Very high/Must'),
    ('Urgent/ASAP')
    on conflict (name) do nothing;