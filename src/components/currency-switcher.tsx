"use client";

import { useEffect, useMemo, useState } from "react";
import type { Currency } from "@/config/product";
import { useI18n } from "@/i18n/client";

const symbols: Record<Currency, string> = { CNY: "¥", HKD: "HK$", USD: "$" };
const fallbackRates: Record<Currency, number> = { CNY: 1, HKD: 1.09, USD: 0.14 };
const currencyStorageKey = "nucleus-currency";
const currencyEventName = "nucleus-currency-change";

function readStoredCurrency(locale: "zh-CN" | "en"): Currency {
  if (locale === "en") return "USD";
  if (typeof window === "undefined") return "CNY";
  return window.localStorage.getItem(currencyStorageKey) === "HKD" ? "HKD" : "CNY";
}

export function CurrencyValue({
  cny,
  className,
}: {
  cny?: number;
  className?: string;
}) {
  const { locale } = useI18n();
  const [currency, setCurrency] = useState<Currency>(() => readStoredCurrency(locale));
  const [rates, setRates] = useState<Record<Currency, number>>(fallbackRates);
  const [rateSource, setRateSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    const onCurrencyChange = (event: Event) => {
      const next = (event as CustomEvent<Currency>).detail;
      if (locale === "en" && next !== "USD") return;
      if (locale === "zh-CN" && next === "USD") return;
      setCurrency(next);
    };
    window.addEventListener(currencyEventName, onCurrencyChange);
    return () => window.removeEventListener(currencyEventName, onCurrencyChange);
  }, [locale]);

  useEffect(() => {
    let active = true;
    void fetch("/api/exchange-rates", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ rates?: Partial<Record<Currency, number>>; source?: "live" | "fallback" }> : null)
      .then((payload) => {
        if (!active || !payload?.rates) return;
        setRates((current) => ({ ...current, ...payload.rates }));
        setRateSource(payload.source === "fallback" ? "fallback" : "live");
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const choices = useMemo<Currency[]>(() => locale === "en" ? ["USD"] : ["CNY", "HKD"], [locale]);
  const displayCurrency: Currency = locale === "en" ? "USD" : currency === "USD" ? "CNY" : currency;
  return (
    <div className={`currency-value ${className ?? ""}`}>
      <div role="group" aria-label="显示币种">
        {choices.map((item) => (
          <button
            className={displayCurrency === item ? "active" : ""}
            onClick={() => {
              setCurrency(item);
              window.localStorage.setItem(currencyStorageKey, item);
              window.dispatchEvent(new CustomEvent<Currency>(currencyEventName, { detail: item }));
            }}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      {cny == null ? (
        <b className="no-data">暂无可信成交数据</b>
      ) : (
        <b>
          {symbols[displayCurrency]}
          {(cny * rates[displayCurrency]).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </b>
      )}
      <small>{rateSource === "live"
        ? (locale === "en" ? "Live exchange rate · source amount remains in CNY" : "实时汇率 · 原始金额仍保留 CNY")
        : (locale === "en" ? "Live rate unavailable · safe fallback shown" : "实时汇率暂不可用 · 已显示安全回退值")}</small>
    </div>
  );
}

/** Compact price renderer shared by market cards and homepage surfaces. */
export function DisplayedAmount({ cny, className }: { cny?: number; className?: string }) {
  const { locale } = useI18n();
  const [currency, setCurrency] = useState<Currency>(() => readStoredCurrency(locale));
  const [rates, setRates] = useState<Record<Currency, number>>(fallbackRates);

  useEffect(() => {
    const onCurrencyChange = (event: Event) => {
      const next = (event as CustomEvent<Currency>).detail;
      if (locale === "en" && next !== "USD") return;
      if (locale === "zh-CN" && next === "USD") return;
      setCurrency(next);
    };
    window.addEventListener(currencyEventName, onCurrencyChange);
    return () => window.removeEventListener(currencyEventName, onCurrencyChange);
  }, [locale]);

  useEffect(() => {
    let active = true;
    void fetch("/api/exchange-rates", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ rates?: Partial<Record<Currency, number>> }> : null)
      .then((payload) => {
        if (active && payload?.rates) setRates((current) => ({ ...current, ...payload.rates }));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (cny == null) return <span className={className}>—</span>;
  const displayCurrency: Currency = locale === "en" ? "USD" : currency === "USD" ? "CNY" : currency;
  const label = displayCurrency === "CNY" ? "人民币" : displayCurrency === "HKD" ? "港币" : "USD";
  return <span className={className}>{label} {symbols[displayCurrency]}{Math.round(cny * rates[displayCurrency]).toLocaleString(locale === "en" ? "en-US" : "zh-CN")}</span>;
}

