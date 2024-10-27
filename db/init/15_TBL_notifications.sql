create table if not exists notifications (
    id serial primary key not null,
    user_id int references users(id) not null,
    message text not null,
    is_read bool default false not null,
    created_on timestamptz default current_timestamp not null
);
create index notifications_users_idx on notifications(user_id);