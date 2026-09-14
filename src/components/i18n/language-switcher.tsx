"use client";
import { useI18n } from "@/i18n/client";
export function LanguageSwitcher() { const { locale, setLocale, t } = useI18n(); return <div className="language-switcher" role="group" aria-label={t("language.label")}><button type="button" className={locale === "zh-CN" ? "active" : ""} aria-pressed={locale === "zh-CN"} onClick={() => setLocale("zh-CN")}>{t("language.zh")}</button><button type="button" className={locale === "en" ? "active" : ""} aria-pressed={locale === "en"} onClick={() => setLocale("en")}>{t("language.en")}</button></div>; }
