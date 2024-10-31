create table if not exists task_types (
    id serial primary key not null,
    name varchar(50) not null,
    color varchar(7) not null,  -- Hex color code
    icon varchar(50) null,      -- Material-UI icon name
    created_on timestamptz default current_timestamp not null
);

create table if not exists tasks (
    id serial primary key not null,
    name varchar(100) not null,
    description text null,
    start_date date not null,
    due_date date not null,
    priority_id int references priorities(id) not null default 2, -- Assuming 2 is 'Normal'
    status varchar(20) not null default 'New',
    type_id int references task_types(id) not null,
    parent_id int references tasks(id) null,
    project_id int references projects(id) not null,
    assignee_id int references users(id) null,
    created_by int references users(id) not null,
    created_on timestamptz default current_timestamp not null
);

create index task_project_idx on tasks(project_id);
create index task_assignee_idx on tasks(assignee_id);
create index task_parent_idx on tasks(parent_id);
create index task_type_idx on tasks(type_id);
create index task_priority_idx on tasks(priority_id);  -- Added index for priority

-- Create tags tables
create table if not exists tags (
    id serial primary key not null,
    name varchar(50) not null unique,
    color varchar(7) not null,
    created_on timestamptz default current_timestamp not null
);

create table if not exists task_tags (
    task_id int references tasks(id) on delete cascade not null,
    tag_id int references tags(id) on delete cascade not null,
    created_on timestamptz default current_timestamp not null,
    primary key (task_id, tag_id)
);

create index task_tags_task_idx on task_tags(task_id);
create index task_tags_tag_idx on task_tags(tag_id); 