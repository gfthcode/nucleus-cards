"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function loginPath() {
  return `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}

export function CardActions({ cardId }: { cardId: string }) {
  const client = createSupabaseBrowserClient();
  const router = useRouter();
  const [watching, setWatching] = useState(false);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!client) return;
    void client.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const result = await client.from("watchlist_items").select("id").eq("card_id", cardId).maybeSingle();
      setWatching(Boolean(result.data));
    });
  }, [cardId, client]);

  async function toggleWatchlist() {
    if (!client) { router.push(loginPath()); return; }
    setBusy(true);
    const { data } = await client.auth.getUser();
    if (!data.user) { router.push(loginPath()); return; }
    if (watching) {
      const result = await client.from("watchlist_items").delete().eq("card_id", cardId);
      if (!result.error) setWatching(false);
    } else {
      const result = await client.from("watchlist_items").insert({ card_id: cardId }).select("id").single();
      if (!result.error) setWatching(true);
    }
    setBusy(false);
  }

  function togglePortfolioDraft() {
    if (!client) { setAdded((value) => !value); return; }
    router.push(`/portfolio?card=${encodeURIComponent(cardId)}`);
  }
  return (
    <div className="card-actions">
      <button
        className={`button ${watching ? "button-primary" : "button-secondary"}`}
        data-analytics-event="watchlist_toggled"
        onClick={() => void toggleWatchlist()}
        disabled={busy}
      >
        {watching ? "✓ 已关注" : "＋ 加入关注"}
      </button>
      <button
        className={`button ${added ? "button-primary" : "button-secondary"}`}
        data-analytics-event="portfolio_draft_toggled"
        onClick={togglePortfolioDraft}
      >
        {added ? "✓ 已加入持仓草稿" : "加入持仓"}
      </button>
    </div>
  );
}
