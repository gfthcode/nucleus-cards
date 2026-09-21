-- Player momentum is an explainable attention signal, not a card-price forecast.
create table if not exists public.player_momentum_snapshots (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  momentum_score numeric(5,2) not null check (momentum_score between 0 and 100),
  performance_score numeric(5,2) not null check (performance_score between 0 and 100),
  opportunity_score numeric(5,2) not null check (opportunity_score between 0 and 100),
  role_change_score numeric(5,2) not null check (role_change_score between 0 and 100),
  team_context_score numeric(5,2) not null check (team_context_score between 0 and 100),
  development_score numeric(5,2) not null check (development_score between 0 and 100),
  news_score numeric(5,2) not null check (news_score between 0 and 100),
  availability_score numeric(5,2) not null check (availability_score between 0 and 100),
  attention_score numeric(5,2) not null check (attention_score between 0 and 100),
  data_quality_score numeric(5,2) not null default 0 check (data_quality_score between 0 and 100),
  short_term_outlook text not null default 'NEUTRAL',
  medium_term_outlook text not null default 'NEUTRAL',
  market_attention_outlook text not null default 'STABLE',
  captured_at timestamptz not null default now(),
  source text not null
);
create index if not exists player_momentum_snapshots_player_captured_idx on public.player_momentum_snapshots(player_id, captured_at desc);
alter table public.player_momentum_snapshots enable row level security;
drop policy if exists "momentum snapshots readable" on public.player_momentum_snapshots;
create policy "momentum snapshots readable" on public.player_momentum_snapshots for select to anon, authenticated using (true);

create table if not exists public.nba_news_events (
  id uuid primary key default gen_random_uuid(), player_id text, team_id text,
  event_type text not null, headline text not null, summary text, source text not null, source_url text not null unique, published_at timestamptz, retrieved_at timestamptz not null default now(), reliability_tier smallint not null check (reliability_tier between 1 and 2), confidence text not null check (confidence in ('CONFIRMED','REPORTED','RUMOR','UNKNOWN')), impact_direction text not null check (impact_direction in ('POSITIVE','NEGATIVE','NEUTRAL')), impact_magnitude smallint not null default 0 check (impact_magnitude between -100 and 100)
);
alter table public.nba_news_events enable row level security;
drop policy if exists "nba news readable" on public.nba_news_events;
create policy "nba news readable" on public.nba_news_events for select to anon, authenticated using (true);

create table if not exists public.player_momentum_analyses (
  id uuid primary key default gen_random_uuid(), player_id text not null,
  generated_at timestamptz not null default now(), summary text, catalysts jsonb not null default '[]'::jsonb, risks jsonb not null default '[]'::jsonb, confidence text, data_freshness text, evidence jsonb not null default '[]'::jsonb, analysis_version text not null default 'v1', analysis jsonb not null, source text not null,
  unique (player_id, generated_at)
);
alter table public.player_momentum_analyses enable row level security;
drop policy if exists "momentum analyses readable" on public.player_momentum_analyses;
create policy "momentum analyses readable" on public.player_momentum_analyses for select to anon, authenticated using (true);
create index if not exists nba_news_events_player_published_idx on public.nba_news_events(player_id, published_at desc);
create index if not exists nba_news_events_team_published_idx on public.nba_news_events(team_id, published_at desc);
create index if not exists player_momentum_analyses_player_generated_idx on public.player_momentum_analyses(player_id, generated_at desc);
