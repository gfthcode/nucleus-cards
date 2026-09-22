-- Keep trigger and event-trigger helpers internal. They do not form part of
-- the Data API and must never be callable by anonymous or authenticated users.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
