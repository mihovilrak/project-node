create table if not exists time_entries (
    id serial primary key not null,
    user_id int references users(id) not null,
    task_id int references tasks(id) not null,
    hours numeric(5, 2) not null,
    comments text null,
    spent_on date not null,
    created_on timestamptz default current_timestamp not null
);
create index if not exists time_entries_user_idx on time_entries(user_id);
create index if not exists time_entries_task_idx on time_entries(task_id);
create index if not exists time_entries_spent_on_idx on time_entries(spent_on);