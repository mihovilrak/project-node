create table if not exists users (
    id serial primary key not null,
    login varchar(255) unique not null,
    name varchar(255) not null,
    surname varchar(255) not null,
    email varchar(255) unique not null,
    password varchar(255) not null,
    status_id int references user_statuses(id) default 1 not null,
    role_id int references roles(id) default 4 not null,
    created_on timestamptz default current_timestamp not null,
    updated_on timestamptz null
);
create index user_status_idx on users(status_id);
create index user_roles_idx on users(role_id);