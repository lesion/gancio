--
-- PostgreSQL database dump
--

-- Dumped from database version 11.2 (Debian 11.2-1.pgdg90+1)
-- Dumped by pg_dump version 11.2 (Debian 11.2-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_EventNotifications_status; Type: TYPE; Schema: public; Owner: docker
--

CREATE TYPE public."enum_EventNotifications_status" AS ENUM (
    'new',
    'sent',
    'error'
);


ALTER TYPE public."enum_EventNotifications_status" OWNER TO docker;

--
-- Name: enum_notifications_type; Type: TYPE; Schema: public; Owner: docker
--

CREATE TYPE public.enum_notifications_type AS ENUM (
    'mail',
    'admin_email',
    'mastodon'
);


ALTER TYPE public.enum_notifications_type OWNER TO docker;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: EventNotifications; Type: TABLE; Schema: public; Owner: docker
--

CREATE TABLE public."EventNotifications" (
    status public."enum_EventNotifications_status" DEFAULT 'new'::public."enum_EventNotifications_status",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "eventId" integer NOT NULL,
    "notificationId" integer NOT NULL
);


ALTER TABLE public."EventNotifications" OWNER TO docker;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: docker
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    activitypub_id integer,
    author character varying(255),
    text character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "eventId" integer
);


ALTER TABLE public.comments OWNER TO docker;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: docker
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comments_id_seq OWNER TO docker;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: docker
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: docker
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying(255),
    description text,
    multidate boolean,
    start_datetime timestamp with time zone,
    end_datetime timestamp with time zone,
    image_path character varying(255),
    activitypub_id integer,
    is_visible boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" integer,
    "placeId" integer
);


ALTER TABLE public.events OWNER TO docker;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: docker
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.events_id_seq OWNER TO docker;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: docker
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: docker
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    filters json,
    email character varying(255),
    remove_code character varying(255),
    type public.enum_notifications_type,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO docker;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: docker
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO docker;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: docker
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: places; Type: TABLE; Schema: public; Owner: docker
--

CREATE TABLE public.places (
    id integer NOT NULL,
    name character varying(255),
    address character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.places OWNER TO docker;

--
-- Name: places_id_seq; Type: SEQUENCE; Schema: public; Owner: docker
--

CREATE SEQUENCE public.places_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.places_id_seq OWNER TO docker;

--
-- Name: places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: docker
--

ALTER SEQUENCE public.places_id_seq OWNED BY public.places.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: docker
--

CREATE TABLE public.settings (
    key character varying(255) NOT NULL,
    value json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO docker;

--
-- Name: tagEvent; Type: TABLE; Schema: public; Owner: docker
--

CREATE TABLE public."tagEvent" (
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "eventId" integer NOT NULL,
    "tagTag" character varying(255) NOT NULL
);


ALTER TABLE public."tagEvent" OWNER TO docker;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: docker
--

CREATE TABLE public.tags (
    tag character varying(255) NOT NULL,
    color character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.tags OWNER TO docker;

--
-- Name: users; Type: TABLE; Schema: public; Owner: docker
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    description text,
    password character varying(255),
    recover_code character varying(255),
    is_admin boolean,
    is_active boolean,
    mastodon_auth json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO docker;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: docker
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO docker;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: docker
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: places id; Type: DEFAULT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.places ALTER COLUMN id SET DEFAULT nextval('public.places_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: EventNotifications; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public."EventNotifications" (status, "createdAt", "updatedAt", "eventId", "notificationId") FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public.comments (id, activitypub_id, author, text, "createdAt", "updatedAt", "eventId") FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public.events (id, title, description, multidate, start_datetime, end_datetime, image_path, activitypub_id, is_visible, "createdAt", "updatedAt", "userId", "placeId") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public.notifications (id, filters, email, remove_code, type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: places; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public.places (id, name, address, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public.settings (key, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tagEvent; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public."tagEvent" ("createdAt", "updatedAt", "eventId", "tagTag") FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public.tags (tag, color, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: docker
--

COPY public.users (id, email, description, password, recover_code, is_admin, is_active, mastodon_auth, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: docker
--

SELECT pg_catalog.setval('public.comments_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: docker
--

SELECT pg_catalog.setval('public.events_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: docker
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: docker
--

SELECT pg_catalog.setval('public.places_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: docker
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: EventNotifications EventNotifications_pkey; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public."EventNotifications"
    ADD CONSTRAINT "EventNotifications_pkey" PRIMARY KEY ("eventId", "notificationId");


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: places places_name_key; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_name_key UNIQUE (name);


--
-- Name: places places_pkey; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: tagEvent tagEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public."tagEvent"
    ADD CONSTRAINT "tagEvent_pkey" PRIMARY KEY ("eventId", "tagTag");


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (tag);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: EventNotifications EventNotifications_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public."EventNotifications"
    ADD CONSTRAINT "EventNotifications_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventNotifications EventNotifications_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public."EventNotifications"
    ADD CONSTRAINT "EventNotifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public.notifications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: events events_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "events_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public.places(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: events events_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tagEvent tagEvent_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public."tagEvent"
    ADD CONSTRAINT "tagEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tagEvent tagEvent_tagTag_fkey; Type: FK CONSTRAINT; Schema: public; Owner: docker
--

ALTER TABLE ONLY public."tagEvent"
    ADD CONSTRAINT "tagEvent_tagTag_fkey" FOREIGN KEY ("tagTag") REFERENCES public.tags(tag) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

