create table if not exists activity_types (
    id int2 primary key generated always as identity not null,
    name varchar(50) unique not null,
    color varchar(7) not null,
    description text null,
    icon varchar(50) null,
    active boolean default true not null,
    updated_on timestamptz default current_timestamp null,
    created_on timestamptz default current_timestamp not null
);