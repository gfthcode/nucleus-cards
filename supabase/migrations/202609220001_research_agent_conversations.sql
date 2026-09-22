-- Private, evidence-first research conversations. These rows never become public
-- market data and must always be scoped to the authenticated collector.
create table if not exists public.research_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  card_id text not null,
  player_id text,
  title text not null check (char_length(title) between 1 and 160),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.research_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.research_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 12000),
  evidence jsonb not null default '[]'::jsonb,
  tool_trace jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.research_sessions enable row level security;
alter table public.research_messages enable row level security;

drop policy if exists "research session owner" on public.research_sessions;
create policy "research session owner" on public.research_sessions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "research message session owner" on public.research_messages;
create policy "research message session owner" on public.research_messages
  for all to authenticated
  using (
    exists (
      select 1 from public.research_sessions session
      where session.id = research_messages.session_id
        and session.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.research_sessions session
      where session.id = research_messages.session_id
        and session.user_id = (select auth.uid())
    )
  );

create index if not exists research_sessions_user_updated_idx
  on public.research_sessions(user_id, updated_at desc);
create index if not exists research_messages_session_created_idx
  on public.research_messages(session_id, created_at asc);

drop trigger if exists research_sessions_set_updated_at on public.research_sessions;
create trigger research_sessions_set_updated_at
  before update on public.research_sessions
  for each row execute procedure public.set_updated_at();
