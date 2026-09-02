"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function HeaderControls() {
  const [currency, setCurrency] = useState("CNY");
  const [light, setLight] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("nucleus-theme") === "light";
      setLight(saved);
      document.documentElement.dataset.theme = saved ? "light" : "dark";
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "dark";
    window.localStorage.setItem("nucleus-theme", next ? "light" : "dark");
  }
  return (
    <div className="top-actions">
      <button
        aria-label="切换货币"
        onClick={() =>
          setCurrency(
            currency === "CNY" ? "HKD" : currency === "HKD" ? "USD" : "CNY",
          )
        }
      >
        {currency}⌄
      </button>
      <button
        aria-label={light ? "切换深色主题" : "切换浅色主题"}
        onClick={toggle}
      >
        {light ? "●" : "◐"}
      </button>
      <Link className="profile-button" href="/login">
        演示账户
      </Link>
    </div>
  );
}
