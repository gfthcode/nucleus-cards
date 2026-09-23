"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleUserRound, Moon, Sun } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/i18n/client";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/browser";
import type { Currency } from "@/config/product";

const currencyStorageKey = "nucleus-currency";
const currencyEventName = "nucleus-currency-change";

export function HeaderControls() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>(() => typeof window !== "undefined" && window.localStorage.getItem(currencyStorageKey) === "HKD" ? "HKD" : "CNY");
  const [light, setLight] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("nucleus-theme") === "light");
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = light ? "light" : "dark";
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return undefined;
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user?.email ?? null));
    return () => listener.subscription.unsubscribe();
  }, [light]);
  function toggleCurrency() {
    const next: Currency = locale === "en" ? "USD" : currency === "CNY" ? "HKD" : "CNY";
    setCurrency(next);
    window.localStorage.setItem(currencyStorageKey, next);
    window.dispatchEvent(new CustomEvent<Currency>(currencyEventName, { detail: next }));
  }
  function toggleTheme() {
    const next = !light; setLight(next); document.documentElement.dataset.theme = next ? "light" : "dark"; window.localStorage.setItem("nucleus-theme", next ? "light" : "dark");
  }
  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setEmail(null); router.push("/"); router.refresh();
  }
  const identityLabel = email ? email.split("@")[0] : t("auth.signIn");
  const initial = identityLabel.trim().charAt(0).toUpperCase() || "C";
  return <div className="top-actions">
    <LanguageSwitcher />
    <button className="currency-button" aria-label={locale === "en" ? "Currency: USD" : "切换人民币/港币"} onClick={toggleCurrency}><span>{locale === "en" ? "USD" : currency}</span><small>⌄</small></button>
    <button className="theme-button" aria-label={light ? (locale === "en" ? "Use dark theme" : "切换深色主题") : (locale === "en" ? "Use light theme" : "切换浅色主题")} onClick={toggleTheme}>{light ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}</button>
    {email && hasSupabaseConfig() ? <div className="profile-menu">
      <button className="profile-button" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span className="profile-avatar" aria-hidden>{initial}</span><span>{identityLabel}</span></button>
      {menuOpen && <div className="profile-menu-popover" role="menu">
        <Link href="/settings" role="menuitem" onClick={() => setMenuOpen(false)}>{t("auth.account")}</Link>
        <Link href="/collections" role="menuitem" onClick={() => setMenuOpen(false)}>{t("navigation.collection")}</Link>
        <Link href="/portfolio" role="menuitem" onClick={() => setMenuOpen(false)}>{t("navigation.portfolio")}</Link>
        <Link href="/watchlist" role="menuitem" onClick={() => setMenuOpen(false)}>{t("navigation.watchlist")}</Link>
        <Link href="/alerts" role="menuitem" onClick={() => setMenuOpen(false)}>{t("navigation.alerts")}</Link>
        <button type="button" role="menuitem" onClick={() => void signOut()}>{t("auth.signOut")}</button>
      </div>}
    </div> : <Link className="profile-button" href="/login"><CircleUserRound size={17} aria-hidden /><span>{identityLabel}</span></Link>}
  </div>;
}

