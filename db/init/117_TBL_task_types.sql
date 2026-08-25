create table if not exists task_types (
    id int2 primary key generated always as identity not null,
    name varchar(50) unique not null,
    description text null,
    color varchar(7) not null,
    icon varchar(50) not null,
    active boolean default true not null,
    updated_on timestamptz default current_timestamp null,
    created_on timestamptz default current_timestamp not null
);