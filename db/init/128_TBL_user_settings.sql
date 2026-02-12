create table if not exists user_settings (
    id int primary key generated always as identity not null,
    user_id int references users(id) not null,
    theme varchar(255) not null default 'light',
    language varchar(255) not null default 'en',
    notifications_enabled boolean not null default true,
    email_notifications_enabled boolean not null default true,
    created_on timestamp not null default current_timestamp,
    updated_on timestamp not null default current_timestamp,
    constraint user_settings_unique unique (user_id)
);