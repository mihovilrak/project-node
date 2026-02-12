create table if not exists permissions (
    id int2 primary key generated always as identity not null,
    name varchar(255) unique not null,
    created_on timestamptz default current_timestamp not null
);