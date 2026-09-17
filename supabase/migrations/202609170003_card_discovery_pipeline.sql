-- Resumable real-card discovery metadata. No rows are seeded here.
alter table if exists public.nba_players
  add column if not exists discovery_status text not null default 'NOT_STARTED'
    check (discovery_status in ('NOT_STARTED','QUEUED','RUNNING','COMPLETED','PARTIAL','FAILED')),
  add column if not exists last_discovered_at timestamptz,
  add column if not exists last_error text,
  add column if not exists cards_discovered integer not null default 0,
  add column if not exists listings_processed integer not null default 0;

alter table if exists public.card_identities
  add column if not exists identity_key text,
  add column if not exists identity_confidence text not null default 'LOW'
    check (identity_confidence in ('HIGH','MEDIUM','LOW')),
  add column if not exists image_url text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists card_identities_identity_key_uidx
  on public.card_identities(identity_key)
  where identity_key is not null;
create index if not exists nba_players_discovery_status_idx
  on public.nba_players(discovery_status, market_tier, updated_at);

do $$
begin
  if to_regclass('public.nba_players') is not null
    and not exists (select 1 from pg_constraint where conname = 'card_identities_player_id_fkey') then
    alter table public.card_identities
      add constraint card_identities_player_id_fkey
      foreign key (player_id) references public.nba_players(id) on delete cascade;
  end if;
end $$;

-- Keep the existing public read model; writes remain server/admin-only.
alter table if exists public.nba_players enable row level security;
alter table if exists public.card_identities enable row level security;

