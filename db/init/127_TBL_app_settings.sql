create table if not exists app_settings (
    id integer primary key default 1,
    app_name varchar(255) not null default 'Project Management App',
    company_name varchar(255) not null default 'Project Management Inc.',
    sender_email varchar(255) not null default 'no-reply@projectmanagementapp.com',
    time_zone varchar(255) not null default 'Europe/Zagreb',
    theme varchar(255) not null default 'light',
    created_on timestamp not null default current_timestamp,
    updated_on timestamp not null default current_timestamp,
    constraint single_row check (id = 1)
);