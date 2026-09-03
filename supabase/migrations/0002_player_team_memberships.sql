create type public.roster_type as enum (
  'active', 'two_way', 'inactive', 'injured', 'g_league_assignment',
  '10_day', 'exhibit_10', 'waived', 'free_agent'
);

create type public.membership_verification as enum ('verified', 'probable', 'stale', 'disputed');

create table public.player_team_memberships (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  status text not null check (status in ('active', 'inactive', 'ended')),
  start_date date not null,
  end_date date,
  jersey_number text,
  roster_type public.roster_type not null,
  source text not null,
  last_verified_at timestamptz not null default now(),
  verification_status public.membership_verification not null default 'probable',
  source_player_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (player_id, team_id, start_date)
);

create index player_team_memberships_current_idx
  on public.player_team_memberships(team_id, status, roster_type)
  where status = 'active';

alter table public.player_team_memberships enable row level security;
create policy "Public can read verified memberships"
  on public.player_team_memberships for select to anon, authenticated
  using (verification_status = 'verified');
