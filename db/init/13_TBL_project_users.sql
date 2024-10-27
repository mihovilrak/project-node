create table if not exists project_users (
    project_id int references projects(id) not null,
    user_id int references users(id) not null,
    created_on timestamptz default current_timestamp not null,
    primary key (project_id, user_id)
);