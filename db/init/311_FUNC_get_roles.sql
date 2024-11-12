create or replace function get_roles()
returns table (
    id integer,
    name character varying,
    description text,
    is_active boolean,
    permissions jsonb
) as $$
begin
    return query 
    select 
      r.id,
      r.role as name,
      r.description,
      r.is_active,
      coalesce(
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'description', p.description
          )
        ) filter (where p.id is not null),
        '[]'
      ) as permissions
    from roles r
    left join roles_permissions rp on r.id = rp.role_id
    left join permissions p on rp.permission_id = p.id
    group by r.id
    order by r.role;
end;
$$ language plpgsql;
