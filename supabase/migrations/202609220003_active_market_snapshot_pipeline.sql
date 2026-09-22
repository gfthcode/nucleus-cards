-- Additive migration: Browse API rows are active-market evidence only.
alter table public.market_listings add column if not exists marketplace text not null default 'EBAY_US';
alter table public.market_listings add column if not exists image_url text;
alter table public.market_listings add column if not exists buying_option text;
alter table public.market_listings add column if not exists rejection_reason text;
alter table public.market_price_observations add column if not exists marketplace text not null default 'EBAY_US';
alter table public.market_price_snapshots add column if not exists observation_type text not null default 'ACTIVE_MARKET_SNAPSHOT';
alter table public.market_price_snapshots drop constraint if exists market_price_snapshots_observation_type_check;
alter table public.market_price_snapshots add constraint market_price_snapshots_observation_type_check check (observation_type = 'ACTIVE_MARKET_SNAPSHOT');
alter table public.market_price_observations drop constraint if exists market_price_observations_observation_type_check;
alter table public.market_price_observations add constraint market_price_observations_observation_type_check check (observation_type in ('ACTIVE_FIXED_PRICE','LIVE_AUCTION_CURRENT_BID'));
create index if not exists market_listings_source_marketplace_item_idx on public.market_listings(source, marketplace, source_item_id);
