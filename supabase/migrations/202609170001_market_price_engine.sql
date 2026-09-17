-- Nucleus-owned eBay active-market observations and snapshots.
-- Verified sales remain separate and are never inferred from listing disappearance.
create table if not exists public.market_sources (
  id text primary key,
  name text not null,
  marketplace text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.card_identities (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  player_name text not null,
  season text,
  year integer,
  brand text,
  set_name text,
  card_number text,
  parallel text,
  rookie boolean,
  autograph boolean,
  memorabilia boolean,
  serial_number text,
  print_run integer,
  grading_company text,
  grade numeric,
  raw_or_graded text,
  created_at timestamptz not null default now(),
  unique (player_id, year, brand, set_name, card_number, parallel, grading_company, grade, raw_or_graded)
);

create table if not exists public.market_listings (
  id uuid primary key default gen_random_uuid(),
  source text not null references public.market_sources(id),
  source_item_id text not null,
  card_identity_id uuid references public.card_identities(id),
  price numeric,
  currency text,
  shipping_price numeric,
  source_url text not null,
  condition text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz,
  last_retrieved_at timestamptz not null default now(),
  status text not null default 'active',
  identity_confidence text not null default 'LOW',
  is_outlier boolean not null default false,
  unique (source, source_item_id)
);

create table if not exists public.market_price_observations (
  id uuid primary key default gen_random_uuid(),
  card_identity_id uuid not null references public.card_identities(id),
  source text not null references public.market_sources(id),
  source_item_id text not null,
  observation_type text not null check (observation_type = 'ACTIVE_FIXED_PRICE'),
  price numeric,
  currency text,
  retrieved_at timestamptz not null default now(),
  identity_confidence text not null default 'LOW',
  is_outlier boolean not null default false,
  unique (source, source_item_id, retrieved_at)
);

create table if not exists public.market_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  card_identity_id uuid not null references public.card_identities(id),
  source text not null references public.market_sources(id),
  captured_at timestamptz not null default now(),
  sample_size integer not null default 0,
  median_price numeric,
  mean_price numeric,
  low_price numeric,
  high_price numeric,
  p25 numeric,
  p75 numeric,
  currency text
);

create table if not exists public.verified_sales (
  id uuid primary key default gen_random_uuid(),
  card_identity_id uuid not null references public.card_identities(id),
  source text not null,
  source_item_id text not null,
  sold_price numeric not null,
  currency text not null,
  sold_at timestamptz not null,
  source_url text not null,
  verified_at timestamptz not null default now(),
  unique (source, source_item_id)
);

alter table public.market_sources enable row level security;
alter table public.card_identities enable row level security;
alter table public.market_listings enable row level security;
alter table public.market_price_observations enable row level security;
alter table public.market_price_snapshots enable row level security;
alter table public.verified_sales enable row level security;

drop policy if exists "public can read market sources" on public.market_sources;
create policy "public can read market sources" on public.market_sources for select to anon, authenticated using (true);
drop policy if exists "public can read card identities" on public.card_identities;
create policy "public can read card identities" on public.card_identities for select to anon, authenticated using (true);
drop policy if exists "public can read market listings" on public.market_listings;
create policy "public can read market listings" on public.market_listings for select to anon, authenticated using (true);
drop policy if exists "public can read market observations" on public.market_price_observations;
create policy "public can read market observations" on public.market_price_observations for select to anon, authenticated using (true);
drop policy if exists "public can read market snapshots" on public.market_price_snapshots;
create policy "public can read market snapshots" on public.market_price_snapshots for select to anon, authenticated using (true);
drop policy if exists "public can read verified sales" on public.verified_sales;
create policy "public can read verified sales" on public.verified_sales for select to anon, authenticated using (true);

insert into public.market_sources (id, name, marketplace)
values ('ebay', 'eBay Browse API', 'EBAY_US')
on conflict (id) do nothing;

create index if not exists market_listings_card_identity_idx on public.market_listings(card_identity_id, last_retrieved_at desc);
create index if not exists market_observations_card_time_idx on public.market_price_observations(card_identity_id, retrieved_at desc);
create index if not exists market_snapshots_card_time_idx on public.market_price_snapshots(card_identity_id, captured_at desc);
