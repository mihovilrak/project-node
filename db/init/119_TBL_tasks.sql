create table if not exists tasks (
    id serial primary key not null,
    name varchar(100) not null,
    description text null,
    start_date date not null,
    due_date date not null,
    end_date date null,
    priority_id int references priorities(id) not null default 2,
    status_id int references task_statuses(id) not null default 1,
    type_id int references task_types(id) not null,
    parent_id int references tasks(id) null,
    project_id int references projects(id) not null,
    holder_id int references users(id) null,
    assignee_id int references users(id) null,
    created_by int references users(id) not null,
    created_on timestamptz default current_timestamp not null,
    updated_on timestamptz null default current_timestamp
);

create index if not exists task_status_idx on tasks(status_id);
create index if not exists task_project_idx on tasks(project_id);
create index if not exists task_holder_idx on tasks(holder_id);
create index if not exists task_assignee_idx on tasks(assignee_id);
create index if not exists task_parent_idx on tasks(parent_id);
create index if not exists task_type_idx on tasks(type_id);
create index if not exists task_priority_idx on tasks(priority_id);
create index if not exists task_created_by_idx on tasks(created_by);