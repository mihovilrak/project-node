create table if not exists projects (
    id int primary key generated always as identity not null,
    name varchar(50) not null,
    description text null,
    start_date date not null,
    end_date date null,
    due_date date not null,
    parent_id int references projects(id) null,
    status_id int2 references project_statuses(id) default 1 not null,
    created_by int references users(id) not null,
    created_on timestamptz default current_timestamp not null,
    updated_on timestamptz null default current_timestamp,
    check (due_date >= start_date),
    check (end_date >= start_date)
);
create index if not exists project_created_by_idx on projects(created_by);
create index if not exists project_status_idx on projects(status_id);
create index if not exists project_parent_idx on projects(parent_id);