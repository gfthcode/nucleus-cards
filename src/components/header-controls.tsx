"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleUserRound, Moon, Sun } from "lucide-react";

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
      <button className="currency-button"
        aria-label="切换货币"
        onClick={() =>
          setCurrency(
            currency === "CNY" ? "HKD" : currency === "HKD" ? "USD" : "CNY",
          )
        }
      >
        <span>{currency}</span><small>⌄</small>
      </button>
      <button className="theme-button"
        aria-label={light ? "切换深色主题" : "切换浅色主题"}
        onClick={toggle}
      >
        {light ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
      </button>
      <Link className="profile-button" href="/settings">
        <CircleUserRound size={17} aria-hidden />
        <span>演示账户</span>
      </Link>
    </div>
  );
}
