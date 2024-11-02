create table if not exists comments (
    id serial primary key not null,
    task_id int references tasks(id) not null,
    user_id int references users(id) not null,
    active bool default true not null,
    comment text not null,
    created_on timestamptz default current_timestamp not null
);
create index if not exists comment_task_idx on comments(task_id);
create index if not exists comment_user_idx on comments(user_id);