create table if not exists watchers (
    user_id int not null references users(id),
    task_id int not null references tasks(id),
    created_on timestamptz default current_timestamp,
    primary key (user_id, task_id)
);