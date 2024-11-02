create table if not exists task_tags (
    task_id int references tasks(id) on delete cascade not null,
    tag_id int references tags(id) on delete cascade not null,
    created_on timestamptz default current_timestamp not null,
    primary key (task_id, tag_id)
);