create table if not exists user_statuses (
    id serial primary key not null,
    name varchar(10) unique not null,
    created_on timestamptz default current_timestamp not null
);