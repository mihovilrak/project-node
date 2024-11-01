create table if not exists activity_types (
    id serial primary key not null,
    name varchar(50) not null,
    color varchar(7) not null,  -- Hex color code
    description text null,
    is_active boolean default true not null,
    created_on timestamptz default current_timestamp not null
);