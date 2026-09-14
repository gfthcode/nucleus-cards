export { createSupabaseBrowserClient as getSupabaseBrowserClient, hasSupabaseConfig } from "./supabase/browser";

export function isDemoMode() {
  return !hasSupabaseConfig() || process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
}

import { hasSupabaseConfig } from "./supabase/browser";
