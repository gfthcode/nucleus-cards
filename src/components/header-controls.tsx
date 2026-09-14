"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleUserRound, Moon, Sun } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/i18n/client";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/browser";

export function HeaderControls() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [currency, setCurrency] = useState("CNY");
  const [light, setLight] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("nucleus-theme") === "light");
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = light ? "light" : "dark";
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return undefined;
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user?.email ?? null));
    return () => listener.subscription.unsubscribe();
  }, [light]);
  function toggleTheme() {
    const next = !light; setLight(next); document.documentElement.dataset.theme = next ? "light" : "dark"; window.localStorage.setItem("nucleus-theme", next ? "light" : "dark");
  }
  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setEmail(null); router.push("/"); router.refresh();
  }
  const identityLabel = email ? email.split("@")[0] : t("auth.signIn");
  return <div className="top-actions">
    <LanguageSwitcher />
    <button className="currency-button" aria-label={locale === "en" ? "Switch currency" : "切换货币"} onClick={() => setCurrency(currency === "CNY" ? "HKD" : currency === "HKD" ? "USD" : "CNY")}><span>{currency}</span><small>⌄</small></button>
    <button className="theme-button" aria-label={light ? (locale === "en" ? "Use dark theme" : "切换深色主题") : (locale === "en" ? "Use light theme" : "切换浅色主题")} onClick={toggleTheme}>{light ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}</button>
    {email && hasSupabaseConfig() ? <button className="profile-button" type="button" onClick={() => void signOut()} title={t("auth.signOut")}><CircleUserRound size={17} aria-hidden /><span>{identityLabel}</span></button> : <Link className="profile-button" href="/login"><CircleUserRound size={17} aria-hidden /><span>{identityLabel}</span></Link>}
  </div>;
}
