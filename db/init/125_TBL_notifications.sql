create table if not exists notifications (
    id int primary key generated always as identity not null,
    user_id int references users(id) on delete cascade not null,
    type_id int2 references notification_types(id) not null,
    title varchar(100) not null,
    message text not null,
    link varchar(255) null,
    data jsonb null,
    is_read boolean default false not null,
    active boolean default true not null,
    read_on timestamptz null,
    created_on timestamptz default current_timestamp not null
);

create index if not exists notifications_user_idx on notifications(user_id);
create index if not exists notifications_type_idx on notifications(type_id);
create index if not exists notifications_created_idx on notifications(created_on);
create index if not exists notifications_user_active_created_idx on notifications (user_id, active, created_on desc);