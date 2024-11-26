create or replace function get_roles()
returns table (
    id integer,
    name character varying,
    description text,
    active boolean,
    permissions json
) as $$
begin
    return query 
    select 
      r.id,
      r.name,
      r.description,
      r.active,
      coalesce(
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name
          )
        ) filter (where p.id is not null),
        '[]'
      ) as permissions
    from roles r
    left join roles_permissions rp on r.id = rp.role_id
    left join permissions p on rp.permission_id = p.id
    group by r.id
    order by r.name;
end;
$$ language plpgsql;
