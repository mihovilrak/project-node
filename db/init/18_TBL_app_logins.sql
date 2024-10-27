create table if not exists app_logins (
    id serial primary key not null,
    user_id int references users(id) not null,
    logged_on timestamptz default current_timestamp not null
);
create index login_idx on app_logins(user_id);