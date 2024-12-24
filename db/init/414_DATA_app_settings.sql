insert into app_settings (id) values (1)
on conflict (id) do nothing;