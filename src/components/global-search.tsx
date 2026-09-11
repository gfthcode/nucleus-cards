"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/market?q=${encodeURIComponent(value)}`);
  }
  return <form className="global-search" onSubmit={submit} role="search">
    <Search size={16} aria-hidden />
    <input aria-label="全局搜索" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索球员、卡片或球队" />
    <button className="global-search-submit" type="submit" aria-label="执行搜索">↵</button>
    <kbd>⌘ K</kbd>
  </form>;
}
