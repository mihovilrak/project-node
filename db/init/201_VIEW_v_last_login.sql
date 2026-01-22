create or replace view v_last_login as
    select  user_id,
            logged_on,
            row_number()
            over(
                partition by user_id
                order by logged_on desc
            ) login_rn
    from app_logins;