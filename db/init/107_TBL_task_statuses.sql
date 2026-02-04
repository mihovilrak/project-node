create table if not exists task_statuses (
    id serial primary key not null,
    name varchar(50) unique not null,
    color varchar(7) not null default '#9E9E9E',
    created_on timestamptz default current_timestamp not null
);
alter table task_statuses add column if not exists color varchar(7) not null default '#9E9E9E';