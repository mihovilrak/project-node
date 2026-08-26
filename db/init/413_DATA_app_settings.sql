-- app_settings holds a single row (check (id = 1)), and id is an identity
-- column: a plain re-run would be handed id = 2 and fail the constraint.
insert into app_settings (id) overriding system value
select 1
where not exists (select 1 from app_settings);
