create table if not exists files (
    id int primary key generated always as identity not null,
    task_id int references tasks(id) not null,
    user_id int references users(id) not null,
    original_name text not null,
    stored_name text not null,
    size bigint not null,
    mime_type varchar(255) not null,
    file_path text not null,
    uploaded_on timestamptz default current_timestamp not null,
    check (size >= 0)
);
create index if not exists file_tasks_idx on files(task_id);
create index if not exists uploaded_idx on files(user_id);