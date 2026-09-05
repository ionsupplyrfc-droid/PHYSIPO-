-- フィジポッ（Physipo）データベーススキーマ
-- REGAIN 要件定義書 4節に基づく。Day1時点ではRLSは導入せず、アプリ側でuser_idによる絞り込みを行う。

create table if not exists users (
  id serial primary key,
  name text not null,
  role text not null default 'player' check (role in ('player', 'staff', 'coach')),
  created_at timestamptz not null default now()
);

create table if not exists cases (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  case_code text not null,
  disease_category text not null check (disease_category in ('脳血管', '廃用', '運動器')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_cases_user_id on cases(user_id);

create table if not exists sessions (
  id serial primary key,
  case_id integer not null references cases(id) on delete cascade,
  user_id integer not null references users(id) on delete cascade,
  intervention_day integer,
  age integer,
  rom_data jsonb not null default '{}'::jsonb,
  mmt_data jsonb not null default '{}'::jsonb,
  disease_specific_data jsonb not null default '{}'::jsonb,
  intervention_content text,
  assessment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sessions_case_id on sessions(case_id);
create index if not exists idx_sessions_user_id on sessions(user_id);

create table if not exists tags (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create index if not exists idx_tags_user_id on tags(user_id);

create table if not exists session_tags (
  session_id integer not null references sessions(id) on delete cascade,
  tag_id integer not null references tags(id) on delete cascade,
  primary key (session_id, tag_id)
);

create table if not exists intervention_menu (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create index if not exists idx_intervention_menu_user_id on intervention_menu(user_id);

create table if not exists templates (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  name text not null,
  disease_category text not null check (disease_category in ('脳血管', '廃用', '運動器')),
  template_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_templates_user_id on templates(user_id);
