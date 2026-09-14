import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Locale } from "@/config/product";

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export function hasServerSupabaseConfig() { return Boolean(getConfig()); }

export async function createSupabaseServerClient() {
  const config = getConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {
          // Server Components cannot write cookies; src/proxy.ts refreshes them on requests.
        }
      },
    },
  });
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null };
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || typeof userId !== "string") return { supabase, user: null };
  const { data: userData } = await supabase.auth.getUser();
  return { supabase, user: userData.user };
}

export function safeReturnTo(value: string | null | undefined, fallback = "/portfolio") {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export type AccountPreferences = { locale: Locale; currency: "CNY" | "HKD" | "USD"; theme: "dark" | "light"; grid_view: "grid" | "list"; default_market_view: "grid" | "table"; notifications_enabled: boolean; };
