"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/config/product";
import { getMessages, type Messages, type TranslationKey } from "./messages";

const localeCookieName = "nucleus-locale";

type I18nContextValue = { locale: Locale; messages: Messages; t: (key: TranslationKey) => string; setLocale: (locale: Locale) => void; };
const I18nContext = createContext<I18nContextValue | null>(null);
export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter(); const [locale, setCurrentLocale] = useState(initialLocale);
  const setLocale = useCallback((nextLocale: Locale) => { if (nextLocale === locale) return; document.cookie = `${localeCookieName}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`; window.localStorage.setItem(localeCookieName, nextLocale); document.documentElement.lang = nextLocale === "en" ? "en" : "zh-CN"; setCurrentLocale(nextLocale); router.refresh(); }, [locale, router]);
  const value = useMemo(() => ({ locale, messages: getMessages(locale), t: (key: TranslationKey) => getMessages(locale)[key], setLocale }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export function useI18n() { const context = useContext(I18nContext); if (!context) throw new Error("useI18n must be used inside LocaleProvider"); return context; }
