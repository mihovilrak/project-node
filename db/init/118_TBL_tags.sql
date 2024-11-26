create table if not exists tags (
    id serial primary key not null,
    name varchar(50) unique not null,
    color varchar(7) not null,
    active boolean default true not null,
    updated_on timestamptz default current_timestamp null,
    created_on timestamptz default current_timestamp not null
);