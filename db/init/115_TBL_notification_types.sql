create table if not exists notification_types (
    id serial primary key not null,
    name varchar(50) unique not null,
    icon varchar(50) not null,
    color varchar(7) not null,
    created_on timestamptz default current_timestamp not null
);