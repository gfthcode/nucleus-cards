import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const ADMIN_KEY_ERROR = "SUPABASE_ADMIN_KEY_NOT_CONFIGURED";

export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const adminKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !adminKey) {
    throw new Error(ADMIN_KEY_ERROR);
  }

  return createClient(url, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
