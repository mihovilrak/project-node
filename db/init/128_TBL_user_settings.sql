create table if not exists user_settings (
    user_id int primary key references users(id),
    theme varchar(255) not null default 'light',
    language varchar(255) not null default 'en',
    notifications_enabled boolean not null default true,
    email_notifications_enabled boolean not null default true,
    created_on timestamp not null default current_timestamp,
    updated_on timestamp not null default current_timestamp
);