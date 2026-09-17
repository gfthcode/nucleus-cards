-- Scalable NBA hierarchy. Rows are populated only by a verified roster sync.
create table if not exists public.nba_teams (
  id text primary key,
  external_id text,
  name text not null,
  abbreviation text not null unique,
  city text,
  conference text,
  division text,
  active boolean not null default true,
  source text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.nba_players (
  id text primary key,
  external_player_id text,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  team_id text references public.nba_teams(id),
  position text,
  jersey_number text,
  active boolean not null default true,
  rookie_year integer,
  draft_year integer,
  market_tier text not null default 'C' check (market_tier in ('S', 'A', 'B', 'C')),
  source text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_market_metrics (
  player_id text primary key references public.nba_players(id) on delete cascade,
  active_listing_count integer not null default 0,
  card_count integer not null default 0,
  market_activity_score numeric,
  liquidity_score numeric,
  updated_at timestamptz not null default now()
);

alter table public.nba_teams enable row level security;
alter table public.nba_players enable row level security;
alter table public.player_market_metrics enable row level security;

drop policy if exists "public can read nba teams" on public.nba_teams;
create policy "public can read nba teams" on public.nba_teams for select to anon, authenticated using (true);
drop policy if exists "public can read nba players" on public.nba_players;
create policy "public can read nba players" on public.nba_players for select to anon, authenticated using (true);
drop policy if exists "public can read player metrics" on public.player_market_metrics;
create policy "public can read player metrics" on public.player_market_metrics for select to anon, authenticated using (true);

create index if not exists nba_players_team_idx on public.nba_players(team_id);
create index if not exists nba_players_full_name_idx on public.nba_players using gin (to_tsvector('simple', full_name));
create index if not exists nba_players_market_tier_idx on public.nba_players(market_tier);
