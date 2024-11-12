--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: authentification(character varying, character varying); Type: FUNCTION; Schema: public; Owner: pm
--

CREATE FUNCTION public.authentification(auth_login character varying, auth_password character varying) RETURNS TABLE(id integer, login character varying, password character varying, role_id integer)
    LANGUAGE plpgsql
    AS $$

begin
    return query
    select  u.id,
            u.login,
            u.password,
            u.role_id
    from users u
    where u.login = auth_login
    and u.password = crypt(auth_password, u.password);
end;

$$;


ALTER FUNCTION public.authentification(auth_login character varying, auth_password character varying) OWNER TO pm;

--
-- Name: change_project_status(integer); Type: FUNCTION; Schema: public; Owner: pm
--

CREATE FUNCTION public.change_project_status(project_id integer) RETURNS TABLE(message text)
    LANGUAGE plpgsql
    AS $_$
    begin

        -- Update the active status of the given project 
        update projects 
        set status_id = case 
                        when status_id = 1 then 2 
                        when status_id = 2 then 1
                     end 
        where id = $1;

        -- Return message query
        return query
            select concat(
                'Project status changed to ', 
                case 
                    when status_id = 1 then 'active' 
                    when status_id = 2 then 'inactive' 
                end,
                ' for project ', 
                name,
                '.'
            ) as message
            from projects 
            where id = $1;

    end;
$_$;


ALTER FUNCTION public.change_project_status(project_id integer) OWNER TO pm;

--
-- Name: delete_project(integer); Type: FUNCTION; Schema: public; Owner: pm
--

CREATE FUNCTION public.delete_project(project_id integer) RETURNS TABLE(message text)
    LANGUAGE plpgsql
    AS $_$
    begin

        -- Update the active status of the given project 
        update projects 
        set active = 3 
        where id = $1;

        -- Return message query
        return query
            select 
                concat(
                    'Project ', 
                    name, 
                    ' deleted.'
                ) as message
            from projects 
            where id = $1;

    end;
$_$;


ALTER FUNCTION public.delete_project(project_id integer) OWNER TO pm;

--
-- Name: projects_for_users(integer); Type: FUNCTION; Schema: public; Owner: pm
--

CREATE FUNCTION public.projects_for_users(user_id integer) RETURNS TABLE(id integer, name character varying, description text, start_date date, end_date date, due_date date, status_id integer, created_by integer, created_on timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$

begin
    return query 
    select p.* 
    from projects p 
    left join project_users pu on pu.project_id = p.id
    where user_id = $1
    and p.status_id != 3;
end;

$_$;


ALTER FUNCTION public.projects_for_users(user_id integer) OWNER TO pm;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: priorities; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.priorities (
    id integer NOT NULL,
    priority character varying(50) NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.priorities OWNER TO pm;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    start_date date NOT NULL,
    end_date date,
    due_date date NOT NULL,
    parent_id integer,
    status_id integer DEFAULT 1 NOT NULL,
    created_by integer NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.projects OWNER TO pm;

--
-- Name: task_statuses; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.task_statuses (
    id integer NOT NULL,
    status character varying(50) NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.task_statuses OWNER TO pm;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    start_date date NOT NULL,
    due_date date NOT NULL,
    end_date date,
    priority_id integer DEFAULT 2 NOT NULL,
    status_id integer DEFAULT 1 NOT NULL,
    type_id integer NOT NULL,
    parent_id integer,
    project_id integer NOT NULL,
    holder_id integer,
    assignee_id integer,
    created_by integer NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tasks OWNER TO pm;

--
-- Name: users; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.users (
    id integer NOT NULL,
    login character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    surname character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    status_id integer DEFAULT 1 NOT NULL,
    role_id integer DEFAULT 4 NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_on timestamp with time zone
);


ALTER TABLE public.users OWNER TO pm;

--
-- Name: v_task_assignees; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.v_task_assignees AS
 SELECT t.id AS task_id,
    t.assignee_id,
    u.name
   FROM (public.tasks t
     LEFT JOIN public.users u ON ((u.id = t.assignee_id)));


ALTER VIEW public.v_task_assignees OWNER TO pm;

--
-- Name: v_task_created_by; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.v_task_created_by AS
 SELECT t.id AS task_id,
    t.created_by,
    u.name
   FROM (public.tasks t
     LEFT JOIN public.users u ON ((u.id = t.created_by)));


ALTER VIEW public.v_task_created_by OWNER TO pm;

--
-- Name: v_task_holders; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.v_task_holders AS
 SELECT t.id AS task_id,
    t.holder_id,
    u.name
   FROM (public.tasks t
     LEFT JOIN public.users u ON ((u.id = t.holder_id)));


ALTER VIEW public.v_task_holders OWNER TO pm;

--
-- Name: v_tasks; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.v_tasks AS
 SELECT t.id AS task_id,
    t.project_id,
    po.name AS project,
    t.holder_id,
    h.name AS holder,
    t.assignee_id,
    a.name AS assignee,
    t.description,
    ts.status,
    pi.priority,
    t.start_date,
    t.due_date,
    t.end_date,
    c.name AS created_by,
    t.created_on
   FROM ((((((public.tasks t
     LEFT JOIN public.projects po ON ((po.id = t.project_id)))
     LEFT JOIN public.v_task_holders h ON ((h.holder_id = t.holder_id)))
     LEFT JOIN public.v_task_assignees a ON ((a.assignee_id = t.assignee_id)))
     LEFT JOIN public.v_task_created_by c ON ((c.created_by = t.created_by)))
     LEFT JOIN public.task_statuses ts ON ((ts.id = t.status_id)))
     LEFT JOIN public.priorities pi ON ((pi.id = t.priority_id)));


ALTER VIEW public.v_tasks OWNER TO pm;

--
-- Name: active_tasks; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.active_tasks AS
 SELECT task_id,
    project_id,
    project,
    holder_id,
    holder,
    assignee_id,
    assignee,
    description,
    status,
    priority,
    start_date,
    due_date,
    end_date,
    created_by,
    created_on
   FROM public.v_tasks
  WHERE (((status)::text <> ALL ((ARRAY['Deleted'::character varying, 'Discarded'::character varying])::text[])) AND (assignee_id IS NOT NULL));


ALTER VIEW public.active_tasks OWNER TO pm;

--
-- Name: activity_types; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.activity_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    color character varying(7) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activity_types OWNER TO pm;

--
-- Name: activity_types_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.activity_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_types_id_seq OWNER TO pm;

--
-- Name: activity_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.activity_types_id_seq OWNED BY public.activity_types.id;


--
-- Name: app_logins; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.app_logins (
    id integer NOT NULL,
    user_id integer NOT NULL,
    logged_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.app_logins OWNER TO pm;

--
-- Name: app_logins_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.app_logins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_logins_id_seq OWNER TO pm;

--
-- Name: app_logins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.app_logins_id_seq OWNED BY public.app_logins.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    task_id integer NOT NULL,
    user_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    comment text NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.comments OWNER TO pm;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO pm;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: files; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.files (
    id integer NOT NULL,
    task_id integer NOT NULL,
    file_path text NOT NULL,
    uploaded_by integer,
    uploaded_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.files OWNER TO pm;

--
-- Name: files_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.files_id_seq OWNER TO pm;

--
-- Name: files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.files_id_seq OWNED BY public.files.id;


--
-- Name: notification_types; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.notification_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    icon character varying(50) NOT NULL,
    color character varying(7) NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification_types OWNER TO pm;

--
-- Name: notification_types_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.notification_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_types_id_seq OWNER TO pm;

--
-- Name: notification_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.notification_types_id_seq OWNED BY public.notification_types.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type_id integer NOT NULL,
    title character varying(100) NOT NULL,
    message text NOT NULL,
    link character varying(255),
    is_read boolean DEFAULT false NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO pm;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO pm;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    permission character varying(255) NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO pm;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO pm;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: priorities_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.priorities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.priorities_id_seq OWNER TO pm;

--
-- Name: priorities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.priorities_id_seq OWNED BY public.priorities.id;


--
-- Name: project_statuses; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.project_statuses (
    id integer NOT NULL,
    status character varying(10) NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_statuses OWNER TO pm;

--
-- Name: project_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.project_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_statuses_id_seq OWNER TO pm;

--
-- Name: project_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.project_statuses_id_seq OWNED BY public.project_statuses.id;


--
-- Name: project_users; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.project_users (
    project_id integer NOT NULL,
    user_id integer NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.project_users OWNER TO pm;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO pm;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role character varying(50) NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.roles OWNER TO pm;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO pm;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: roles_permissions; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.roles_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.roles_permissions OWNER TO pm;

--
-- Name: session; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO pm;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    color character varying(7) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tags OWNER TO pm;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO pm;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: task_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.task_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_statuses_id_seq OWNER TO pm;

--
-- Name: task_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.task_statuses_id_seq OWNED BY public.task_statuses.id;


--
-- Name: task_tags; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.task_tags (
    task_id integer NOT NULL,
    tag_id integer NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.task_tags OWNER TO pm;

--
-- Name: task_types; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.task_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    color character varying(7) NOT NULL,
    icon character varying(50) NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.task_types OWNER TO pm;

--
-- Name: task_types_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.task_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_types_id_seq OWNER TO pm;

--
-- Name: task_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.task_types_id_seq OWNED BY public.task_types.id;


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO pm;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: time_entries; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.time_entries (
    id integer NOT NULL,
    user_id integer NOT NULL,
    task_id integer NOT NULL,
    hours numeric(5,2) NOT NULL,
    comments text,
    spent_on date NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.time_entries OWNER TO pm;

--
-- Name: time_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.time_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.time_entries_id_seq OWNER TO pm;

--
-- Name: time_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.time_entries_id_seq OWNED BY public.time_entries.id;


--
-- Name: time_logs; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.time_logs (
    id integer NOT NULL,
    task_id integer NOT NULL,
    user_id integer NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    description text NOT NULL,
    activity_type_id integer NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.time_logs OWNER TO pm;

--
-- Name: time_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.time_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.time_logs_id_seq OWNER TO pm;

--
-- Name: time_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.time_logs_id_seq OWNED BY public.time_logs.id;


--
-- Name: user_statuses; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.user_statuses (
    id integer NOT NULL,
    status character varying(10) NOT NULL,
    created_on timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_statuses OWNER TO pm;

--
-- Name: user_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.user_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_statuses_id_seq OWNER TO pm;

--
-- Name: user_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.user_statuses_id_seq OWNED BY public.user_statuses.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO pm;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: v_comments; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.v_comments AS
 SELECT c.id,
    c.task_id,
    u.name,
    c.comment,
    c.created_on
   FROM (public.comments c
     LEFT JOIN public.users u ON ((u.id = c.user_id)))
  WHERE (c.active = true)
  ORDER BY c.created_on DESC;


ALTER VIEW public.v_comments OWNER TO pm;

--
-- Name: v_last_login; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.v_last_login AS
 SELECT user_id,
    logged_on,
    row_number() OVER (PARTITION BY user_id ORDER BY logged_on DESC) AS login_rn
   FROM public.app_logins;


ALTER VIEW public.v_last_login OWNER TO pm;

--
-- Name: v_project_members; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.v_project_members AS
 SELECT pu.project_id,
    u.id AS user_id,
    u.name,
    u.surname,
    r.role
   FROM ((public.project_users pu
     JOIN public.users u ON ((u.id = pu.user_id)))
     JOIN public.roles r ON ((r.id = u.role_id)));


ALTER VIEW public.v_project_members OWNER TO pm;

--
-- Name: v_subprojects; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.v_subprojects AS
 SELECT p.id,
    p.name,
    p.description,
    p.start_date,
    p.end_date,
    p.due_date,
    p.parent_id,
    p.status_id,
    p.created_by,
    p.created_on,
    ps.status,
    u.name AS created_by_name,
    parent.name AS parent_name
   FROM (((public.projects p
     LEFT JOIN public.project_statuses ps ON ((ps.id = p.status_id)))
     LEFT JOIN public.users u ON ((u.id = p.created_by)))
     LEFT JOIN public.projects parent ON ((parent.id = p.parent_id)))
  WHERE (p.parent_id IS NOT NULL);


ALTER VIEW public.v_subprojects OWNER TO pm;

--
-- Name: v_users; Type: VIEW; Schema: public; Owner: pm
--

CREATE VIEW public.v_users AS
 SELECT u.id,
    u.login,
    u.name,
    u.surname,
    u.email,
    s.status,
    r.role,
    u.created_on,
    u.updated_on,
    l.logged_on AS last_login
   FROM (((public.users u
     LEFT JOIN public.user_statuses s ON ((s.id = u.status_id)))
     LEFT JOIN public.roles r ON ((r.id = u.role_id)))
     LEFT JOIN public.v_last_login l ON (((l.user_id = u.id) AND (l.login_rn = 1))));


ALTER VIEW public.v_users OWNER TO pm;

--
-- Name: activity_types id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.activity_types ALTER COLUMN id SET DEFAULT nextval('public.activity_types_id_seq'::regclass);


--
-- Name: app_logins id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.app_logins ALTER COLUMN id SET DEFAULT nextval('public.app_logins_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: files id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);


--
-- Name: notification_types id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.notification_types ALTER COLUMN id SET DEFAULT nextval('public.notification_types_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: priorities id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.priorities ALTER COLUMN id SET DEFAULT nextval('public.priorities_id_seq'::regclass);


--
-- Name: project_statuses id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.project_statuses ALTER COLUMN id SET DEFAULT nextval('public.project_statuses_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: task_statuses id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.task_statuses ALTER COLUMN id SET DEFAULT nextval('public.task_statuses_id_seq'::regclass);


--
-- Name: task_types id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.task_types ALTER COLUMN id SET DEFAULT nextval('public.task_types_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: time_entries id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.time_entries ALTER COLUMN id SET DEFAULT nextval('public.time_entries_id_seq'::regclass);


--
-- Name: time_logs id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.time_logs ALTER COLUMN id SET DEFAULT nextval('public.time_logs_id_seq'::regclass);


--
-- Name: user_statuses id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.user_statuses ALTER COLUMN id SET DEFAULT nextval('public.user_statuses_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_types; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.activity_types (id, name, color, description, is_active, created_on) FROM stdin;
1	Development	#2196f3	General development work	t	2024-11-05 23:44:05.875448+01
2	Testing	#9c27b0	Testing and quality assurance	t	2024-11-05 23:44:05.875448+01
3	Documentation	#795548	Writing and updating documentation	t	2024-11-05 23:44:05.875448+01
4	Meeting	#ff9800	Team meetings and discussions	t	2024-11-05 23:44:05.875448+01
5	Code Review	#4caf50	Reviewing and providing feedback on code	t	2024-11-05 23:44:05.875448+01
6	Bug Fixing	#f44336	Fixing bugs and issues	t	2024-11-05 23:44:05.875448+01
7	Planning	#673ab7	Project planning and organization	t	2024-11-05 23:44:05.875448+01
8	Research	#607d8b	Research and investigation	t	2024-11-05 23:44:05.875448+01
9	Analysis	#00bcd4	System and requirement analysis	t	2024-11-05 23:44:05.875448+01
10	Design	#e91e63	UI/UX and system design	t	2024-11-05 23:44:05.875448+01
11	DevOps	#795548	Infrastructure and deployment work	t	2024-11-05 23:44:05.875448+01
12	Support	#ff5722	User and system support	t	2024-11-05 23:44:05.875448+01
13	Other	#9e9e9e	Other activities	t	2024-11-05 23:44:05.875448+01
\.


--
-- Data for Name: app_logins; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.app_logins (id, user_id, logged_on) FROM stdin;
1	1	2024-11-05 23:44:36.385285+01
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.comments (id, task_id, user_id, active, comment, created_on) FROM stdin;
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.files (id, task_id, file_path, uploaded_by, uploaded_on) FROM stdin;
\.


--
-- Data for Name: notification_types; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.notification_types (id, name, icon, color, created_on) FROM stdin;
1	Task Due Soon	AccessTime	#ff9800	2024-11-05 23:44:06.890112+01
2	Task Assigned	Assignment	#2196f3	2024-11-05 23:44:06.890112+01
3	Task Updated	Update	#4caf50	2024-11-05 23:44:06.890112+01
4	Task Comment	Comment	#9c27b0	2024-11-05 23:44:06.890112+01
5	Task Completed	CheckCircle	#4caf50	2024-11-05 23:44:06.890112+01
6	Project Update	Folder	#2196f3	2024-11-05 23:44:06.890112+01
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.notifications (id, user_id, type_id, title, message, link, is_read, created_on) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.permissions (id, permission, created_on) FROM stdin;
1	Admin	2024-11-05 23:44:05.630823+01
2	Create projects	2024-11-05 23:44:05.630823+01
3	Edit projects	2024-11-05 23:44:05.630823+01
4	Delete projects	2024-11-05 23:44:05.630823+01
5	Create tasks	2024-11-05 23:44:05.630823+01
6	Edit tasks	2024-11-05 23:44:05.630823+01
7	Delete tasks	2024-11-05 23:44:05.630823+01
8	Log time	2024-11-05 23:44:05.630823+01
9	Edit log	2024-11-05 23:44:05.630823+01
10	Delete log	2024-11-05 23:44:05.630823+01
\.


--
-- Data for Name: priorities; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.priorities (id, priority, created_on) FROM stdin;
1	Low/Wont	2024-11-05 23:44:05.936155+01
2	Normal/Could	2024-11-05 23:44:05.936155+01
3	High/Should	2024-11-05 23:44:05.936155+01
4	Very high/Must	2024-11-05 23:44:05.936155+01
5	Urgent/ASAP	2024-11-05 23:44:05.936155+01
\.


--
-- Data for Name: project_statuses; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.project_statuses (id, status, created_on) FROM stdin;
1	Active	2024-11-05 23:44:06.012578+01
2	Inactive	2024-11-05 23:44:06.012578+01
3	Deleted	2024-11-05 23:44:06.012578+01
\.


--
-- Data for Name: project_users; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.project_users (project_id, user_id, created_on) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.projects (id, name, description, start_date, end_date, due_date, parent_id, status_id, created_by, created_on) FROM stdin;
1	Test	Testni projekt	2024-11-05	\N	2024-11-30	\N	1	1	2024-11-05 23:44:59.390256+01
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.roles (id, role, created_on) FROM stdin;
1	Admin	2024-11-05 23:44:05.718754+01
2	Project manager	2024-11-05 23:44:05.718754+01
3	Developer	2024-11-05 23:44:05.718754+01
4	Reporter	2024-11-05 23:44:05.718754+01
\.


--
-- Data for Name: roles_permissions; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.roles_permissions (role_id, permission_id, created_on) FROM stdin;
1	1	2024-11-05 23:44:06.281313+01
2	2	2024-11-05 23:44:06.281313+01
2	3	2024-11-05 23:44:06.281313+01
2	4	2024-11-05 23:44:06.281313+01
2	5	2024-11-05 23:44:06.281313+01
2	6	2024-11-05 23:44:06.281313+01
2	7	2024-11-05 23:44:06.281313+01
2	8	2024-11-05 23:44:06.281313+01
2	9	2024-11-05 23:44:06.281313+01
2	10	2024-11-05 23:44:06.281313+01
3	5	2024-11-05 23:44:06.281313+01
3	6	2024-11-05 23:44:06.281313+01
3	7	2024-11-05 23:44:06.281313+01
3	8	2024-11-05 23:44:06.281313+01
3	9	2024-11-05 23:44:06.281313+01
3	10	2024-11-05 23:44:06.281313+01
4	8	2024-11-05 23:44:06.281313+01
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.session (sid, sess, expire) FROM stdin;
KEBZHu5w-Hez-eZGVpt59w89G1VcpaUJ	{"cookie":{"originalMaxAge":3600000,"expires":"2024-11-05T23:44:36.383Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"user":{"id":1,"login":"admin","role":1}}	2024-11-06 00:45:45
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.tags (id, name, color, active, updated_at, created_on) FROM stdin;
1	Frontend	#e91e63	t	2024-11-05 23:44:06.757861+01	2024-11-05 23:44:06.757861+01
2	Backend	#2196f3	t	2024-11-05 23:44:06.757861+01	2024-11-05 23:44:06.757861+01
3	Database	#ff9800	t	2024-11-05 23:44:06.757861+01	2024-11-05 23:44:06.757861+01
4	UI/UX	#9c27b0	t	2024-11-05 23:44:06.757861+01	2024-11-05 23:44:06.757861+01
5	API	#4caf50	t	2024-11-05 23:44:06.757861+01	2024-11-05 23:44:06.757861+01
6	Security	#f44336	t	2024-11-05 23:44:06.757861+01	2024-11-05 23:44:06.757861+01
7	Performance	#ff5722	t	2024-11-05 23:44:06.757861+01	2024-11-05 23:44:06.757861+01
8	DevOps	#795548	t	2024-11-05 23:44:06.757861+01	2024-11-05 23:44:06.757861+01
\.


--
-- Data for Name: task_statuses; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.task_statuses (id, status, created_on) FROM stdin;
1	New (backlog)	2024-11-05 23:44:06.09896+01
2	Not started	2024-11-05 23:44:06.09896+01
3	In progress	2024-11-05 23:44:06.09896+01
4	Revision	2024-11-05 23:44:06.09896+01
5	Check	2024-11-05 23:44:06.09896+01
6	Done	2024-11-05 23:44:06.09896+01
7	Discarted	2024-11-05 23:44:06.09896+01
8	Deleted	2024-11-05 23:44:06.09896+01
\.


--
-- Data for Name: task_tags; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.task_tags (task_id, tag_id, created_on) FROM stdin;
\.


--
-- Data for Name: task_types; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.task_types (id, name, color, icon, created_on) FROM stdin;
1	Task	#2196f3	Assignment	2024-11-05 23:44:05.794826+01
2	Bug	#f44336	BugReport	2024-11-05 23:44:05.794826+01
3	Work Package	#4caf50	Work	2024-11-05 23:44:05.794826+01
4	Code Review	#9c27b0	Code	2024-11-05 23:44:05.794826+01
5	Feature	#ff9800	Stars	2024-11-05 23:44:05.794826+01
6	Documentation	#795548	Description	2024-11-05 23:44:05.794826+01
7	Testing	#607d8b	Science	2024-11-05 23:44:05.794826+01
8	Research	#673ab7	Search	2024-11-05 23:44:05.794826+01
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.tasks (id, name, description, start_date, due_date, end_date, priority_id, status_id, type_id, parent_id, project_id, holder_id, assignee_id, created_by, created_on) FROM stdin;
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.time_entries (id, user_id, task_id, hours, comments, spent_on, created_on) FROM stdin;
\.


--
-- Data for Name: time_logs; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.time_logs (id, task_id, user_id, start_time, end_time, description, activity_type_id, created_on) FROM stdin;
\.


--
-- Data for Name: user_statuses; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.user_statuses (id, status, created_on) FROM stdin;
1	Active	2024-11-05 23:44:06.2101+01
2	Inactive	2024-11-05 23:44:06.2101+01
3	Deleted	2024-11-05 23:44:06.2101+01
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.users (id, login, name, surname, email, password, status_id, role_id, created_on, updated_on) FROM stdin;
1	admin	Admin	PM	admin@admin.com	$2a$12$2sTc3WHw57MrdjhNl8QX4.tjROH5W0W5POxI9AFkJ0iXTP2vexwTS	1	1	2024-11-05 23:44:06.367691+01	\N
\.


--
-- Name: activity_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.activity_types_id_seq', 13, true);


--
-- Name: app_logins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.app_logins_id_seq', 1, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.comments_id_seq', 1, false);


--
-- Name: files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.files_id_seq', 1, false);


--
-- Name: notification_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.notification_types_id_seq', 6, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.permissions_id_seq', 10, true);


--
-- Name: priorities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.priorities_id_seq', 5, true);


--
-- Name: project_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.project_statuses_id_seq', 3, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.tags_id_seq', 8, true);


--
-- Name: task_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.task_statuses_id_seq', 8, true);


--
-- Name: task_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.task_types_id_seq', 8, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.tasks_id_seq', 1, false);


--
-- Name: time_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.time_entries_id_seq', 1, false);


--
-- Name: time_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.time_logs_id_seq', 1, false);


--
-- Name: user_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.user_statuses_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: activity_types activity_types_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.activity_types
    ADD CONSTRAINT activity_types_pkey PRIMARY KEY (id);


--
-- Name: app_logins app_logins_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.app_logins
    ADD CONSTRAINT app_logins_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: notification_types notification_types_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_types_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_permission_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_permission_key UNIQUE (permission);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: priorities priorities_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.priorities
    ADD CONSTRAINT priorities_pkey PRIMARY KEY (id);


--
-- Name: priorities priorities_priority_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.priorities
    ADD CONSTRAINT priorities_priority_key UNIQUE (priority);


--
-- Name: project_statuses project_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_pkey PRIMARY KEY (id);


--
-- Name: project_statuses project_statuses_status_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_status_key UNIQUE (status);


--
-- Name: project_users project_users_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_pkey PRIMARY KEY (project_id, user_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: roles_permissions roles_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.roles_permissions
    ADD CONSTRAINT roles_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_key UNIQUE (role);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: task_statuses task_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.task_statuses
    ADD CONSTRAINT task_statuses_pkey PRIMARY KEY (id);


--
-- Name: task_statuses task_statuses_status_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.task_statuses
    ADD CONSTRAINT task_statuses_status_key UNIQUE (status);


--
-- Name: task_tags task_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.task_tags
    ADD CONSTRAINT task_tags_pkey PRIMARY KEY (task_id, tag_id);


--
-- Name: task_types task_types_name_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.task_types
    ADD CONSTRAINT task_types_name_key UNIQUE (name);


--
-- Name: task_types task_types_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.task_types
    ADD CONSTRAINT task_types_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- Name: time_logs time_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_pkey PRIMARY KEY (id);


--
-- Name: user_statuses user_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.user_statuses
    ADD CONSTRAINT user_statuses_pkey PRIMARY KEY (id);


--
-- Name: user_statuses user_statuses_status_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.user_statuses
    ADD CONSTRAINT user_statuses_status_key UNIQUE (status);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: comment_task_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX comment_task_idx ON public.comments USING btree (task_id);


--
-- Name: comment_user_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX comment_user_idx ON public.comments USING btree (user_id);


--
-- Name: file_tasks_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX file_tasks_idx ON public.files USING btree (task_id);


--
-- Name: login_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX login_idx ON public.app_logins USING btree (user_id);


--
-- Name: notifications_created_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX notifications_created_idx ON public.notifications USING btree (created_on);


--
-- Name: notifications_type_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX notifications_type_idx ON public.notifications USING btree (type_id);


--
-- Name: notifications_user_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX notifications_user_idx ON public.notifications USING btree (user_id);


--
-- Name: project_created_by_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX project_created_by_idx ON public.projects USING btree (created_by);


--
-- Name: project_parent_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX project_parent_idx ON public.projects USING btree (parent_id);


--
-- Name: project_status_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX project_status_idx ON public.projects USING btree (status_id);


--
-- Name: session_expire_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX session_expire_idx ON public.session USING btree (expire);


--
-- Name: task_assignee_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX task_assignee_idx ON public.tasks USING btree (assignee_id);


--
-- Name: task_created_by_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX task_created_by_idx ON public.tasks USING btree (created_by);


--
-- Name: task_holder_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX task_holder_idx ON public.tasks USING btree (holder_id);


--
-- Name: task_parent_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX task_parent_idx ON public.tasks USING btree (parent_id);


--
-- Name: task_priority_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX task_priority_idx ON public.tasks USING btree (priority_id);


--
-- Name: task_project_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX task_project_idx ON public.tasks USING btree (project_id);


--
-- Name: task_status_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX task_status_idx ON public.tasks USING btree (status_id);


--
-- Name: task_type_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX task_type_idx ON public.tasks USING btree (type_id);


--
-- Name: time_entries_spent_on_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX time_entries_spent_on_idx ON public.time_entries USING btree (spent_on);


--
-- Name: time_entries_task_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX time_entries_task_idx ON public.time_entries USING btree (task_id);


--
-- Name: time_entries_user_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX time_entries_user_idx ON public.time_entries USING btree (user_id);


--
-- Name: time_logs_activity_type_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX time_logs_activity_type_idx ON public.time_logs USING btree (activity_type_id);


--
-- Name: time_logs_start_time_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX time_logs_start_time_idx ON public.time_logs USING btree (start_time);


--
-- Name: time_logs_task_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX time_logs_task_idx ON public.time_logs USING btree (task_id);


--
-- Name: time_logs_user_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX time_logs_user_idx ON public.time_logs USING btree (user_id);


--
-- Name: uploaded_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX uploaded_idx ON public.files USING btree (uploaded_by);


--
-- Name: user_roles_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX user_roles_idx ON public.users USING btree (role_id);


--
-- Name: user_status_idx; Type: INDEX; Schema: public; Owner: pm
--

CREATE INDEX user_status_idx ON public.users USING btree (status_id);


--
-- Name: app_logins app_logins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.app_logins
    ADD CONSTRAINT app_logins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comments comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: files files_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: files files_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: notifications notifications_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.notification_types(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_users project_users_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: project_users project_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: projects projects_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.projects(id);


--
-- Name: projects projects_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.project_statuses(id);


--
-- Name: roles_permissions roles_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.roles_permissions
    ADD CONSTRAINT roles_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: roles_permissions roles_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.roles_permissions
    ADD CONSTRAINT roles_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: task_tags task_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.task_tags
    ADD CONSTRAINT task_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: task_tags task_tags_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.task_tags
    ADD CONSTRAINT task_tags_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: tasks tasks_holder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_holder_id_fkey FOREIGN KEY (holder_id) REFERENCES public.users(id);


--
-- Name: tasks tasks_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.tasks(id);


--
-- Name: tasks tasks_priority_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_priority_id_fkey FOREIGN KEY (priority_id) REFERENCES public.priorities(id);


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: tasks tasks_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.task_statuses(id);


--
-- Name: tasks tasks_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.task_types(id);


--
-- Name: time_entries time_entries_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: time_entries time_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: time_logs time_logs_activity_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_activity_type_id_fkey FOREIGN KEY (activity_type_id) REFERENCES public.activity_types(id);


--
-- Name: time_logs time_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: time_logs time_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.time_logs
    ADD CONSTRAINT time_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: users users_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.user_statuses(id);


--
-- PostgreSQL database dump complete
--

