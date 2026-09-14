-- Nucleus Cards personal collector workspace. Apply with the Supabase CLI or SQL editor.
-- User-owned rows always derive their owner from auth.uid(); do not use a service-role key in browser code.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = timezone('utc', now()); return new; end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  avatar_url text,
  locale text not null default 'zh-CN' check (locale in ('zh-CN', 'en')),
  currency text not null default 'CNY' check (currency in ('CNY', 'HKD', 'USD')),
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  is_public boolean not null default false,
  cover_card_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  card_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  grade text,
  purchase_price numeric(14,2) check (purchase_price is null or purchase_price >= 0),
  purchase_currency text check (purchase_currency is null or purchase_currency in ('CNY', 'HKD', 'USD')),
  purchase_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (collection_id, card_id, grade)
);

create table if not exists public.portfolio_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  card_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  purchase_price numeric(14,2) not null check (purchase_price >= 0),
  purchase_currency text not null default 'CNY' check (purchase_currency in ('CNY', 'HKD', 'USD')),
  purchase_date date,
  platform text,
  fees numeric(14,2) not null default 0 check (fees >= 0),
  shipping numeric(14,2) not null default 0 check (shipping >= 0),
  tax numeric(14,2) not null default 0 check (tax >= 0),
  grading_cost numeric(14,2) not null default 0 check (grading_cost >= 0),
  notes text,
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  card_id text not null,
  target_price numeric(14,2) check (target_price is null or target_price >= 0),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, card_id)
);

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  card_id text not null,
  condition_type text not null check (condition_type in ('price_above', 'price_below', 'daily_change', 'volume_spike', 'new_sale')),
  target_value numeric(14,2) not null check (target_value >= 0),
  enabled boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  locale text not null default 'zh-CN' check (locale in ('zh-CN', 'en')),
  currency text not null default 'CNY' check (currency in ('CNY', 'HKD', 'USD')),
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  grid_view text not null default 'grid' check (grid_view in ('grid', 'list')),
  default_market_view text not null default 'grid' check (default_market_view in ('grid', 'table')),
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.ensure_owned_collection_item() returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.user_id := auth.uid();
  if not exists (select 1 from public.collections where id = new.collection_id and user_id = auth.uid()) then raise exception 'collection is not owned by the authenticated user'; end if;
  return new;
end;
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(nullif(split_part(new.email, '@', 1), ''), 'Collector')) on conflict (id) do nothing;
  insert into public.collections (user_id, name) values (new.id, 'My Collection') on conflict do nothing;
  insert into public.user_preferences (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
drop trigger if exists collection_items_owner on public.collection_items;
create trigger collection_items_owner before insert or update on public.collection_items for each row execute procedure public.ensure_owned_collection_item();

do $$ declare tab text; begin
  foreach tab in array array['profiles','collections','collection_items','portfolio_positions','watchlist_items','price_alerts','user_preferences'] loop execute format('alter table public.%I enable row level security', tab); end loop;
end $$;

create policy "profile owner" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "collection owner" on public.collections for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "collection item owner" on public.collection_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "position owner" on public.portfolio_positions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "watchlist owner" on public.watchlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "alert owner" on public.price_alerts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "preference owner" on public.user_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists collections_user_id_idx on public.collections(user_id);
create index if not exists collection_items_user_id_idx on public.collection_items(user_id);
create index if not exists portfolio_positions_user_id_idx on public.portfolio_positions(user_id);
create index if not exists watchlist_items_user_id_idx on public.watchlist_items(user_id);
create index if not exists price_alerts_user_id_idx on public.price_alerts(user_id);
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger collections_set_updated_at before update on public.collections for each row execute procedure public.set_updated_at();
create trigger collection_items_set_updated_at before update on public.collection_items for each row execute procedure public.set_updated_at();
create trigger portfolio_positions_set_updated_at before update on public.portfolio_positions for each row execute procedure public.set_updated_at();
create trigger price_alerts_set_updated_at before update on public.price_alerts for each row execute procedure public.set_updated_at();
create trigger preferences_set_updated_at before update on public.user_preferences for each row execute procedure public.set_updated_at();
