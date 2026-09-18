-- Run this once in Supabase > SQL Editor

create table players (
  gdbp_number int generated always as identity (start with 1001) primary key,
  usr_name    text not null unique,
  passwd      text not null,            -- stored as salt:hash, never plain text
  created_at  timestamptz default now()
);

create table login_log (
  log_id      bigint generated always as identity primary key,
  gdbp_number int not null references players(gdbp_number),
  login_time  timestamptz default now()
);

create table matches (
  match_id     bigint generated always as identity primary key,
  gdbp_number  int not null references players(gdbp_number),
  score        int not null,
  duration_sec int not null,
  played_at    timestamptz default now()
);

-- One row per player: totals worked out with JOIN, COUNT, SUM, MAX, GROUP BY
create view player_stats with (security_invoker = on) as
select p.gdbp_number, p.usr_name,
       (select count(*) from login_log l where l.gdbp_number = p.gdbp_number) as logins,
       count(m.match_id)                as matches,
       coalesce(max(m.score), 0)        as best_score,
       coalesce(sum(m.score), 0)        as total_score,
       coalesce(sum(m.duration_sec), 0) as total_seconds
from players p
left join matches m on m.gdbp_number = p.gdbp_number
group by p.gdbp_number, p.usr_name;

-- Lock the tables: only our server (service key) can read/write
alter table players   enable row level security;
alter table login_log enable row level security;
alter table matches   enable row level security;
