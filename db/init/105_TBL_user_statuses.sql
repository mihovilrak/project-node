create table if not exists user_statuses (
    id int2 primary key generated always as identity not null,
    name varchar(10) unique not null,
    color varchar(7) not null default '#9E9E9E',
    created_on timestamptz default current_timestamp not null
);