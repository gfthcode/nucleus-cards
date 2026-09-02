"use client";

import { useState } from "react";
import type { Currency } from "@/config/product";

const rates: Record<Currency, number> = { CNY: 1, HKD: 0.916, USD: 7.17 };
const symbols: Record<Currency, string> = { CNY: "¥", HKD: "HK$", USD: "$" };

export function CurrencyValue({
  cny,
  className,
}: {
  cny?: number;
  className?: string;
}) {
  const [currency, setCurrency] = useState<Currency>("CNY");
  return (
    <div className={`currency-value ${className ?? ""}`}>
      <div role="group" aria-label="显示币种">
        {(["CNY", "HKD", "USD"] as Currency[]).map((item) => (
          <button
            className={currency === item ? "active" : ""}
            onClick={() => setCurrency(item)}
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
          {symbols[currency]}
          {(cny / rates[currency]).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </b>
      )}
      <small>按演示汇率换算 · 原始记录保留成交时点汇率</small>
    </div>
  );
}
