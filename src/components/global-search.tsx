"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/i18n/client";

export function GlobalSearch() {
  const router = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/market?q=${encodeURIComponent(value)}`);
  }
  return <form className="global-search" onSubmit={submit} role="search">
    <Search size={16} aria-hidden />
    <input aria-label={t("search.label")} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search.placeholder")} />
    <button className="global-search-submit" type="submit" aria-label={t("search.submit")}>↵</button>
    <kbd>⌘ K</kbd>
  </form>;
}
