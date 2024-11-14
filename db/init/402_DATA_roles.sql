insert into roles (role) values
    ('Admin'),
    ('Project manager'),
    ('Developer'),
    ('Reporter')
    on conflict (role) do nothing;