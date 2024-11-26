create table if not exists permissions (
    id serial primary key not null,
    name varchar(255) unique not null,
    created_on timestamptz default current_timestamp not null
);