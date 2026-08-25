create table if not exists priorities (
    id int2 primary key generated always as identity not null,
    name varchar(50) unique not null,
    color varchar(7) not null,
    created_on timestamptz default current_timestamp
);