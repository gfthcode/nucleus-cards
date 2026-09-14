"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cards, getPlayer } from "@/lib/demo-data";

type WorkspaceMode = "portfolio" | "collection" | "watchlist" | "alerts";
type Row = Record<string, unknown>;

const cardOptions = cards.map((card) => ({
  id: card.id,
  label: `${getPlayer(card.playerId)?.name ?? "未知球员"} · ${card.releaseYear} ${card.productLine} #${card.cardNumber}`,
}));

const copy = {
  portfolio: { kicker: "PRIVATE PORTFOLIO", title: "我的真实持仓", empty: "还没有同步的持仓。添加第一张卡，数据会只对你的账号可见。" },
  collection: { kicker: "PRIVATE COLLECTION", title: "我的收藏", empty: "你的个人收藏还是空的。收藏卡片后会显示在这里。" },
  watchlist: { kicker: "PRIVATE WATCHLIST", title: "我的关注", empty: "还没有关注卡片。你可以在卡片详情页加入关注。" },
  alerts: { kicker: "PRIVATE ALERTS", title: "我的价格提醒", empty: "还没有价格提醒。创建提醒后将只保存到你的账号。" },
} as const;

function cardLabel(cardId: string) {
  return cardOptions.find((card) => card.id === cardId)?.label ?? cardId;
}

export function PersonalWorkspace({ mode }: { mode: WorkspaceMode }) {
  const client = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<Row[]>([]);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ cardId: cardOptions[0]?.id ?? "", quantity: "1", purchasePrice: "", targetPrice: "" });

  const load = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    setError("");
    const table = mode === "portfolio" ? "portfolio_positions" : mode === "collection" ? "collection_items" : mode === "watchlist" ? "watchlist_items" : "price_alerts";
    if (mode === "collection") {
      const collection = await client.from("collections").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (collection.error) setError(collection.error.message);
      setCollectionId((collection.data as { id?: string } | null)?.id ?? null);
      if (!collection.data?.id) { setRows([]); setLoading(false); return; }
      const result = await client.from(table).select("*").eq("collection_id", collection.data.id).order("created_at", { ascending: false });
      if (result.error) setError(result.error.message);
      setRows((result.data as Row[] | null) ?? []);
    } else {
      const result = await client.from(table).select("*").order("created_at", { ascending: false });
      if (result.error) setError(result.error.message);
      setRows((result.data as Row[] | null) ?? []);
    }
    setLoading(false);
  }, [client, mode]);

  // The effect synchronizes the external Supabase store into local React state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function addItem(event: React.FormEvent) {
    event.preventDefault();
    if (!client || (mode === "collection" && !collectionId)) return;
    setBusy(true); setError("");
    const payload = mode === "portfolio"
      ? { card_id: form.cardId, quantity: Number(form.quantity), purchase_price: Number(form.purchasePrice), purchase_currency: "CNY" }
      : mode === "collection"
        ? { collection_id: collectionId, card_id: form.cardId, quantity: Number(form.quantity), purchase_price: form.purchasePrice ? Number(form.purchasePrice) : null, purchase_currency: "CNY" }
        : mode === "watchlist"
          ? { card_id: form.cardId, target_price: form.targetPrice ? Number(form.targetPrice) : null }
          : { card_id: form.cardId, condition_type: "price_below", target_value: Number(form.targetPrice || 0), enabled: true };
    const table = mode === "portfolio" ? "portfolio_positions" : mode === "collection" ? "collection_items" : mode === "watchlist" ? "watchlist_items" : "price_alerts";
    const result = await client.from(table).insert(payload as never).select().single();
    if (result.error) setError(result.error.message);
    else { setRows((current) => [result.data as Row, ...current]); setForm((current) => ({ ...current, quantity: "1", purchasePrice: "", targetPrice: "" })); }
    setBusy(false);
  }

  async function removeItem(id: string) {
    if (!client) return;
    setBusy(true); setError("");
    const table = mode === "portfolio" ? "portfolio_positions" : mode === "collection" ? "collection_items" : mode === "watchlist" ? "watchlist_items" : "price_alerts";
    const result = await client.from(table).delete().eq("id", id);
    if (result.error) setError(result.error.message);
    else setRows((current) => current.filter((row) => row.id !== id));
    setBusy(false);
  }

  const labels = copy[mode];
  return <section className="data-panel personal-workspace" aria-busy={loading}>
    <div className="section-heading"><div><span className="section-kicker">{labels.kicker}</span><h2>{labels.title}</h2></div><span className="risk-pill low">仅本人可见</span></div>
    <p className="workspace-note">数据通过 Supabase 行级权限隔离，不使用浏览器信任的 user_id，也不会读取演示持仓。</p>
    <form className="workspace-form" onSubmit={addItem}>
      <label>卡片<select value={form.cardId} onChange={(event) => setForm((current) => ({ ...current, cardId: event.target.value }))}>{cardOptions.map((card) => <option key={card.id} value={card.id}>{card.label}</option>)}</select></label>
      {(mode === "portfolio" || mode === "collection") && <label>数量<input type="number" min="1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} /></label>}
      {(mode === "portfolio" || mode === "collection") && <label>买入价（CNY）<input type="number" min="0" step="0.01" value={form.purchasePrice} required={mode === "portfolio"} onChange={(event) => setForm((current) => ({ ...current, purchasePrice: event.target.value }))} /></label>}
      {(mode === "watchlist" || mode === "alerts") && <label>目标价（CNY）<input type="number" min="0" step="0.01" value={form.targetPrice} required={mode === "alerts"} onChange={(event) => setForm((current) => ({ ...current, targetPrice: event.target.value }))} /></label>}
      <button className="button button-primary" type="submit" disabled={busy || loading}>{busy ? "保存中…" : mode === "alerts" ? "创建提醒" : "添加"}</button>
    </form>
    {error && <p className="auth-error" role="alert">保存失败：{error}</p>}
    {loading ? <p className="workspace-empty">加载中…</p> : rows.length === 0 ? <div className="workspace-empty"><b>{labels.empty}</b><small>所有记录均由登录账号独立保存。</small></div> : <div className="workspace-list">{rows.map((row) => <article key={String(row.id)}><div><b>{cardLabel(String(row.card_id))}</b><small>{mode === "portfolio" ? `数量 ${row.quantity} · 成本 ¥${Number(row.purchase_price ?? 0).toLocaleString()}` : mode === "alerts" ? `低于 ¥${Number(row.target_value ?? 0).toLocaleString()} · ${row.enabled ? "监控中" : "已暂停"}` : mode === "watchlist" ? `目标价 ${row.target_price == null ? "未设置" : `¥${Number(row.target_price).toLocaleString()}`}` : `数量 ${row.quantity ?? 1}`}</small></div><button className="button button-ghost compact" type="button" onClick={() => void removeItem(String(row.id))} disabled={busy}>删除</button></article>)}</div>}
    <Link className="workspace-link" href="/methodology">了解个人数据隔离与数据口径 →</Link>
  </section>;
}
