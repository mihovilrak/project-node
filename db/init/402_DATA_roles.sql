insert into roles (name) values
    ('Admin'),
    ('Project manager'),
    ('Developer'),
    ('Reporter')
on conflict (name) do nothing;