create table if not exists roles_permissions (
    role_id int references roles(id) not null,
    permission_id int references permissions(id) not null,
    created_on timestamptz default current_timestamp not null,
    primary key(role_id, permission_id)
);