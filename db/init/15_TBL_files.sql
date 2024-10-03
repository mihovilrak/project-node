create table if not exists files (
    id serial primary key not null,
    task_id int references tasks(id) not null,
    file_path text not null,
    uploaded_by int references users(id),
    uploaded_on timestamptz default current_timestamp not null
);
create index file_tasks_idx on files(task_id);
create index uploaded_idx on files(uploaded_by);