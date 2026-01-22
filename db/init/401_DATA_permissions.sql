insert into permissions (name) values
    ('Admin'),
    ('Create projects'),
    ('Edit projects'),
    ('Delete projects'),
    ('Create tasks'),
    ('Edit tasks'),
    ('Delete tasks'),
    ('Log time'),
    ('Edit log'),
    ('Delete log'),
    ('Delete files')
    on conflict (name) do nothing;