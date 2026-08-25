create table if not exists roles (
    id int2 primary key generated always as identity not null,
    name varchar(50) unique not null,
    description text null,
    active boolean default true not null,
    created_on timestamptz default current_timestamp not null
);