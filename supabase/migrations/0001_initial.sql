-- Nucleus Cards initial PostgreSQL / Supabase schema
-- Run with `supabase db reset` locally or paste into a reviewed Supabase migration.
create extension if not exists pgcrypto;

create type public.app_role as enum ('collector','reviewer','admin');
create type public.currency_code as enum ('CNY','HKD','USD');
create type public.risk_level as enum ('low','medium','high');
create type public.authorization_status as enum ('licensed','official-api','community','demo','adapter-only');
create type public.player_cohort as enum ('core_rookie','recent_rookie','young_core','prime','veteran','retired_legend');

create table public.roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'collector',
  created_at timestamptz not null default now()
);

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_slug text unique,
  nickname text not null default 'Collector',
  avatar_url text,
  bio text,
  locale text not null default 'zh-CN' check (locale in ('zh-CN','zh-HK')),
  display_currency public.currency_code not null default 'CNY',
  timezone text not null default 'Asia/Shanghai' check (timezone in ('Asia/Shanghai','Asia/Hong_Kong')),
  show_cost boolean not null default false,
  show_profit boolean not null default false,
  show_exact_value boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  abbreviation text not null unique,
  name text not null,
  city text not null,
  conference text not null check (conference in ('East','West')),
  division text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.draft_classes (
  year integer primary key check (year between 1946 and 2100),
  label text not null,
  status text not null default 'historical',
  data_completeness numeric(5,2) not null default 0
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  external_key text unique,
  name text not null,
  display_name_zh text,
  position text,
  birth_date date,
  draft_year integer references public.draft_classes(year),
  draft_pick integer check (draft_pick is null or draft_pick > 0),
  current_team_id uuid references public.teams(id) on delete set null,
  cohort public.player_cohort not null default 'prime',
  is_core_rookie boolean not null default false,
  is_role_player boolean not null default false,
  is_market_active boolean not null default true,
  is_trade_hot boolean not null default false,
  is_signing_hot boolean not null default false,
  injury_watch boolean not null default false,
  active boolean not null default true,
  data_source_id uuid,
  updated_at timestamptz not null default now()
);
create index players_team_idx on public.players(current_team_id);
create index players_draft_idx on public.players(draft_year,draft_pick);
create index players_cohort_idx on public.players(cohort,draft_year);
create index players_market_flags_idx on public.players(is_trade_hot,is_signing_hot,is_role_player) where is_market_active=true;
create index players_name_idx on public.players using gin (to_tsvector('simple',coalesce(name,'') || ' ' || coalesce(display_name_zh,'')));

create table public.player_team_history (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  team_id uuid not null references public.teams(id),
  started_on date,
  ended_on date,
  source_url text,
  unique(player_id,team_id,started_on)
);

create table public.player_game_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  game_date date not null,
  opponent_team_id uuid references public.teams(id),
  minutes numeric(5,2), points integer, rebounds integer, assists integer,
  raw_stats jsonb not null default '{}'::jsonb,
  source_url text,
  unique(player_id,game_date,opponent_team_id)
);
create index player_game_stats_recent_idx on public.player_game_stats(player_id,game_date desc);

create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  region text not null check (region in ('CN','HK','INTL','COMMUNITY')),
  enabled boolean not null default false,
  requires_api_key boolean not null default false,
  supports_listings boolean not null default false,
  supports_sales boolean not null default false,
  authorization public.authorization_status not null,
  terms_url text,
  last_sync_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);
alter table public.players add constraint players_data_source_fk foreign key(data_source_id) references public.data_sources(id) on delete set null;

create table public.injury_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  body_part text, injury_type text, occurred_on date not null,
  recurrence boolean not null default false,
  games_missed integer not null default 0,
  surgery boolean,
  estimated_recovery text,
  returned_on date,
  post_return_minutes_change numeric(8,3),
  post_return_performance_change numeric(8,3),
  source_id uuid references public.data_sources(id),
  source_url text,
  confidence numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);
create index injury_events_player_date_idx on public.injury_events(player_id,occurred_on desc);

create table public.player_news_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  event_type text not null,
  headline text not null,
  occurred_at timestamptz not null,
  source_id uuid references public.data_sources(id),
  source_url text,
  confidence numeric(5,2) not null default 0
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  license_type text,
  license_valid_from date,
  license_valid_to date,
  notes text
);

create table public.product_lines (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  active_from integer,
  active_to integer,
  authorization_note text,
  unique(brand_id,name)
);

create table public.card_sets (
  id uuid primary key default gen_random_uuid(),
  product_line_id uuid not null references public.product_lines(id),
  release_year integer not null,
  name text not null,
  checklist_url text,
  unique(product_line_id,release_year,name)
);

create table public.grading_companies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  scale_max numeric(4,2) not null default 10
);

create table public.card_variants (
  id uuid primary key default gen_random_uuid(),
  identity_key text not null unique,
  card_set_id uuid not null references public.card_sets(id),
  player_id uuid not null references public.players(id),
  printed_team_id uuid references public.teams(id),
  draft_year integer references public.draft_classes(year),
  release_year integer not null,
  card_number text not null,
  rookie boolean not null default false,
  card_type text not null,
  parallel text not null default 'Base',
  color text,
  print_run integer check (print_run is null or print_run > 0),
  autograph boolean not null default false,
  autograph_type text,
  memorabilia boolean not null default false,
  material_type text,
  match_confidence numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);
create index card_variants_filter_idx on public.card_variants(player_id,draft_year,release_year,rookie,card_type);
create index card_variants_printed_team_idx on public.card_variants(printed_team_id);

create table public.graded_cards (
  id uuid primary key default gen_random_uuid(),
  card_variant_id uuid not null references public.card_variants(id) on delete cascade,
  grading_company_id uuid not null references public.grading_companies(id),
  grade numeric(4,2) not null,
  certification_number text,
  population integer,
  unique(card_variant_id,grading_company_id,grade,certification_number)
);

create table public.card_images (
  id uuid primary key default gen_random_uuid(),
  card_variant_id uuid not null references public.card_variants(id) on delete cascade,
  side text not null check(side in ('front','back')),
  url text not null,
  rights_status text not null default 'unverified',
  source_url text,
  unique(card_variant_id,side,url)
);

create table public.marketplaces (
  id uuid primary key default gen_random_uuid(),
  data_source_id uuid not null references public.data_sources(id),
  name text not null,
  region text not null,
  unique(data_source_id,name)
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  marketplace_id uuid not null references public.marketplaces(id),
  card_variant_id uuid references public.card_variants(id),
  graded_card_id uuid references public.graded_cards(id),
  source_listing_id text,
  listed_at timestamptz not null,
  amount numeric(18,2) not null check(amount >= 0),
  currency public.currency_code not null,
  converted_amount numeric(18,2),
  converted_currency public.currency_code,
  original_url text,
  fetched_at timestamptz not null default now(),
  authorization public.authorization_status not null,
  raw_data jsonb not null default '{}'::jsonb,
  unique(marketplace_id,source_listing_id)
create index listings_card_time_idx on public.listings(card_variant_id,listed_at desc);

create table public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  rate_at timestamptz not null,
  base_currency public.currency_code not null,
  quote_currency public.currency_code not null,
  rate numeric(18,8) not null check(rate > 0),
  source_id uuid references public.data_sources(id),
  unique(rate_at,base_currency,quote_currency,source_id)
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  marketplace_id uuid not null references public.marketplaces(id),
  card_variant_id uuid references public.card_variants(id),
  graded_card_id uuid references public.graded_cards(id),
  source_sale_id text,
  sold_at timestamptz not null,
  amount numeric(18,2) not null check(amount >= 0),
  currency public.currency_code not null,
  converted_amount numeric(18,2),
  converted_currency public.currency_code,
  exchange_rate_id uuid references public.exchange_rates(id),
  shipping numeric(18,2) not null default 0,
  tax numeric(18,2) not null default 0,
  platform_fee numeric(18,2) not null default 0,
  is_bundle boolean not null default false,
  verified boolean not null default false,
  community_submitted boolean not null default false,
  duplicate_of uuid references public.sales(id),
  is_outlier boolean not null default false,
  exclusion_reason text,
  original_url text,
  fetched_at timestamptz not null default now(),
  authorization public.authorization_status not null,
  raw_data jsonb not null default '{}'::jsonb,
  unique(marketplace_id,source_sale_id)
);
create index sales_card_time_idx on public.sales(card_variant_id,sold_at desc);
create index sales_calculation_idx on public.sales(card_variant_id,is_bundle,is_outlier,duplicate_of);

create table public.price_snapshots (
  id uuid primary key default gen_random_uuid(),
  card_variant_id uuid not null references public.card_variants(id) on delete cascade,
  snapshot_at timestamptz not null,
  currency public.currency_code not null,
  latest_sale numeric(18,2),
  median_sale numeric(18,2),
  weighted_reference numeric(18,2),
  low_range numeric(18,2), high_range numeric(18,2),
  sample_count integer not null default 0,
  listing_count integer not null default 0,
  precise boolean not null default false,
  unique(card_variant_id,snapshot_at,currency)
);
create index price_snapshots_card_time_idx on public.price_snapshots(card_variant_id,snapshot_at desc);

create table public.market_metrics (
  id uuid primary key default gen_random_uuid(),
  card_variant_id uuid not null references public.card_variants(id) on delete cascade,
  calculated_at timestamptz not null,
  change_7d numeric(9,3), change_30d numeric(9,3), change_90d numeric(9,3), change_1y numeric(9,3),
  volatility numeric(9,3), sales_frequency numeric(9,3), data_completeness numeric(5,2),
  unique(card_variant_id,calculated_at)
);

create table public.liquidity_metrics (
  id uuid primary key default gen_random_uuid(),
  card_variant_id uuid not null references public.card_variants(id) on delete cascade,
  calculated_at timestamptz not null,
  score integer not null check(score between 0 and 100),
  sales_30d integer not null default 0,
  listing_count integer not null default 0,
  days_since_last_sale integer,
  rationale jsonb not null default '{}'::jsonb,
  unique(card_variant_id,calculated_at)
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Portfolio',
  created_at timestamptz not null default now(),
  unique(user_id,name)
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  card_variant_id uuid not null references public.card_variants(id),
  graded_card_id uuid references public.graded_cards(id),
  quantity integer not null check(quantity > 0),
  purchase_price numeric(18,2) not null check(purchase_price >= 0),
  purchase_currency public.currency_code not null,
  purchased_on date not null,
  platform text,
  platform_fee numeric(18,2) not null default 0,
  shipping numeric(18,2) not null default 0,
  tax numeric(18,2) not null default 0,
  grading_cost numeric(18,2) not null default 0,
  card_condition text,
  note text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
create index portfolio_items_owner_idx on public.portfolio_items(portfolio_id);

create table public.public_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.collection_items (
  collection_id uuid not null references public.public_collections(id) on delete cascade,
  portfolio_item_id uuid not null references public.portfolio_items(id) on delete cascade,
  sort_order integer not null default 0,
  primary key(collection_id,portfolio_item_id)
);

create table public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Watchlist',
  unique(user_id,name)
);
create table public.watchlist_items (
  watchlist_id uuid not null references public.watchlists(id) on delete cascade,
  card_variant_id uuid not null references public.card_variants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(watchlist_id,card_variant_id)
);

create table public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_variant_id uuid references public.card_variants(id),
  player_id uuid references public.players(id),
  rule_type text not null,
  threshold numeric(18,4),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  alert_rule_id uuid references public.alert_rules(id) on delete set null,
  title text not null, body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.risk_signals (
  id uuid primary key default gen_random_uuid(),
  card_variant_id uuid references public.card_variants(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  risk_type text not null,
  level public.risk_level not null,
  trigger_basis text not null,
  source_id uuid references public.data_sources(id),
  impact_direction text not null,
  confidence numeric(5,2) not null,
  updated_at timestamptz not null default now(),
  check(card_variant_id is not null or player_id is not null)
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  card_variant_id uuid references public.card_variants(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  analysis_period text not null,
  payload jsonb not null,
  model_version text not null,
  generated_at timestamptz not null,
  expires_at timestamptz,
  check(card_variant_id is not null or player_id is not null)
);

create table public.data_import_jobs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  source_id uuid references public.data_sources(id),
  filename text,
  status text not null,
  total_rows integer not null default 0,
  accepted_rows integer not null default 0,
  rejected_rows integer not null default 0,
  error_report jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create table public.review_queue (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  reason text not null,
  status text not null default 'pending',
  assigned_to uuid references auth.users(id),
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_time_idx on public.audit_logs(created_at desc);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.roles where user_id=auth.uid() and role='admin');
$$;

alter table public.user_profiles enable row level security;
alter table public.roles enable row level security;
alter table public.portfolios enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.public_collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.alert_rules enable row level security;
alter table public.notifications enable row level security;

create policy "profile owner read write" on public.user_profiles for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "published profile public read" on public.user_profiles for select using(public_slug is not null);
create policy "role owner read" on public.roles for select using(user_id=auth.uid() or public.is_admin());
create policy "portfolio owner" on public.portfolios for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "portfolio item owner" on public.portfolio_items for all using(exists(select 1 from public.portfolios p where p.id=portfolio_id and p.user_id=auth.uid())) with check(exists(select 1 from public.portfolios p where p.id=portfolio_id and p.user_id=auth.uid()));
create policy "public item visibility" on public.portfolio_items for select using(is_public=true);
create policy "collection owner" on public.public_collections for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "published collections read" on public.public_collections for select using(published=true);
create policy "collection item public or owner" on public.collection_items for select using(exists(select 1 from public.public_collections c where c.id=collection_id and (c.published=true or c.user_id=auth.uid())));
create policy "collection item owner write" on public.collection_items for all using(exists(select 1 from public.public_collections c where c.id=collection_id and c.user_id=auth.uid())) with check(exists(select 1 from public.public_collections c where c.id=collection_id and c.user_id=auth.uid()));
create policy "watchlist owner" on public.watchlists for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "watchlist item owner" on public.watchlist_items for all using(exists(select 1 from public.watchlists w where w.id=watchlist_id and w.user_id=auth.uid())) with check(exists(select 1 from public.watchlists w where w.id=watchlist_id and w.user_id=auth.uid()));
create policy "alert owner" on public.alert_rules for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "notification owner" on public.notifications for all using(user_id=auth.uid()) with check(user_id=auth.uid());

-- Public market tables are readable by anonymous users. Writes remain service-role/admin only.
grant select on public.teams,public.draft_classes,public.players,public.player_team_history,public.player_game_stats,public.injury_events,public.player_news_events,public.brands,public.product_lines,public.card_sets,public.card_variants,public.card_images,public.grading_companies,public.graded_cards,public.marketplaces,public.data_sources,public.listings,public.sales,public.price_snapshots,public.market_metrics,public.liquidity_metrics,public.risk_signals,public.ai_analyses to anon,authenticated;
