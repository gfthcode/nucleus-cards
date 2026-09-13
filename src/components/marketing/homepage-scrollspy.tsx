"use client";

import { useCallback, useEffect, useState } from "react";

export const HOMEPAGE_SECTIONS = [
  { id: "home", label: "首页", shortLabel: "首页" },
  { id: "features", label: "功能总览", shortLabel: "功能" },
  { id: "market", label: "市场行情", shortLabel: "行情" },
  { id: "collection", label: "收藏与持仓", shortLabel: "收藏" },
  { id: "scanner", label: "卡片识别", shortLabel: "识别" },
  { id: "faq", label: "FAQ", shortLabel: "FAQ" },
] as const;

export function useHomepageScrollSpy() {
  const [activeId, setActiveId] = useState<(typeof HOMEPAGE_SECTIONS)[number]["id"]>("home");

  useEffect(() => {
    const sections = HOMEPAGE_SECTIONS
      .map((section) => ({ ...section, element: document.getElementById(section.id) }))
      .filter((section): section is typeof section & { element: HTMLElement } => Boolean(section.element));

    if (!sections.length) return undefined;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
        else visible.delete(entry.target.id);
      });

      const next = sections
        .filter((section) => visible.has(section.id))
        .sort((a, b) => (visible.get(b.id) ?? 0) - (visible.get(a.id) ?? 0))[0];

      if (next) setActiveId((current) => current === next.id ? current : next.id);
    }, {
      rootMargin: "-96px 0px -52% 0px",
      threshold: [0, 0.15, 0.35, 0.6],
    });

    sections.forEach((section) => observer.observe(section.element));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id as (typeof HOMEPAGE_SECTIONS)[number]["id"]);
  }, []);

  return { activeId, scrollToSection };
}
