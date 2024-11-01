create table if not exists task_statuses (
    id serial primary key not null,
    status varchar(50) unique not null,
    created_on timestamptz default current_timestamp not null
);