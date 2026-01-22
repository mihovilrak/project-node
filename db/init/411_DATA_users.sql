insert into users (login, name, surname, email, password, role_id)
values ('admin', 'Admin', 'PM', 'admin@admin.com', crypt('password', gen_salt('bf', 12)), 1)
on conflict (login) do nothing;