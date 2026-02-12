create table if not exists app_logins (
    id int primary key generated always as identity not null,
    user_id int references users(id) not null,
    logged_on timestamptz default current_timestamp not null
);
create index if not exists login_idx on app_logins(user_id);