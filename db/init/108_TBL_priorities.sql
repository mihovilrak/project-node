create table if not exists priorities (
    id serial primary key not null,
    name varchar(50) unique not null,
    created_on timestamptz default current_timestamp
);