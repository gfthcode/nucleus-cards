-- Private document-review pipeline and durable generation metadata.
-- Raw files remain in a private Storage bucket; extraction only produces a
-- user-reviewable draft and never creates collection records automatically.

alter table public.research_messages
  add column if not exists model text,
  add column if not exists token_usage jsonb not null default '{}'::jsonb;

create table if not exists public.research_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorite_players text[] not null default '{}',
  preferred_brands text[] not null default '{}',
  budget_notes text check (char_length(budget_notes) <= 600),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.research_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  storage_path text not null unique,
  source_filename text not null check (char_length(source_filename) between 1 and 255),
  mime_type text not null check (mime_type = 'application/pdf'),
  byte_size integer not null check (byte_size > 0 and byte_size <= 10485760),
  status text not null default 'uploaded' check (status in ('uploaded', 'ready_for_review', 'approved', 'rejected', 'failed')),
  extracted_fields jsonb not null default '{}'::jsonb,
  review_notes text check (char_length(review_notes) <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.research_user_preferences enable row level security;
alter table public.research_documents enable row level security;

grant select, insert, update, delete on public.research_user_preferences to authenticated;
grant select, insert, update, delete on public.research_documents to authenticated;

drop policy if exists "research preferences owner" on public.research_user_preferences;
create policy "research preferences owner" on public.research_user_preferences
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "research documents owner" on public.research_documents;
create policy "research documents owner" on public.research_documents
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create index if not exists research_documents_user_updated_idx
  on public.research_documents(user_id, updated_at desc);

drop trigger if exists research_preferences_set_updated_at on public.research_user_preferences;
create trigger research_preferences_set_updated_at
  before update on public.research_user_preferences
  for each row execute procedure public.set_updated_at();

drop trigger if exists research_documents_set_updated_at on public.research_documents;
create trigger research_documents_set_updated_at
  before update on public.research_documents
  for each row execute procedure public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('research-documents', 'research-documents', false, 10485760, array['application/pdf'])
on conflict (id) do update
set public = false, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];

drop policy if exists "research document upload owner" on storage.objects;
create policy "research document upload owner" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'research-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "research document select owner" on storage.objects;
create policy "research document select owner" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'research-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "research document delete owner" on storage.objects;
create policy "research document delete owner" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'research-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
