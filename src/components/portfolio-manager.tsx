"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { Card, Player, PortfolioItem } from "@/types/domain";
import { portfolioItemValue } from "@/lib/market-math";
import { getPlayerCohortLabel } from "@/lib/player-cohorts";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import { Eye, EyeOff } from "lucide-react";

type JoinedCard = Card & { player: Player };
const portfolioStorageKey = "nucleus-portfolio";
const portfolioChangedEvent = "nucleus-portfolio-change";

function useLocalPortfolio(seed: PortfolioItem[]) {
  const seedSnapshot = useMemo(() => JSON.stringify(seed), [seed]);
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(portfolioChangedEvent, onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(portfolioChangedEvent, onStoreChange);
    };
  }, []);
  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(portfolioStorageKey) ?? seedSnapshot;
    } catch {
      return seedSnapshot;
    }
  }, [seedSnapshot]);
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => seedSnapshot,
  );
  const items = useMemo(() => {
    try {
      return JSON.parse(snapshot) as PortfolioItem[];
    } catch {
      return seed;
    }
  }, [seed, snapshot]);
  const setItems = useCallback(
    (
      next: PortfolioItem[] | ((current: PortfolioItem[]) => PortfolioItem[]),
    ) => {
      const value = typeof next === "function" ? next(items) : next;
      try {
        window.localStorage.setItem(portfolioStorageKey, JSON.stringify(value));
      } finally {
        window.dispatchEvent(new Event(portfolioChangedEvent));
      }
    },
    [items],
  );
  return [items, setItems] as const;
}

export function PortfolioManager({
  seed,
  cards,
}: {
  seed: PortfolioItem[];
  cards: JoinedCard[];
}) {
  const [items, setItems] = useLocalPortfolio(seed);
  const [editing, setEditing] = useState<string | null>(null);
  const [valuesVisible, setValuesVisible] = useState(false);
  const [form, setForm] = useState({
    cardId: cards[0]?.id ?? "",
    quantity: "1",
    purchasePrice: "",
    purchaseDate: "2026-08-31",
    platform: "卡展线下",
    isPublic: false,
  });

  const totals = useMemo(
    () =>
      items.reduce(
        (sum, item) => {
          const card = cards.find((row) => row.id === item.cardId);
          const value = portfolioItemValue(item, card?.latestSaleCny);
          return {
            cost: sum.cost + value.cost,
            current: sum.current + value.current,
          };
        },
        { cost: 0, current: 0 },
      ),
    [items, cards],
  );
  const profit = totals.current - totals.cost;
  const portfolioCurrentValue = totals.current;
  const cohortDistribution = useMemo(() => {
    const values = new Map<string, { label: string; value: number }>();
    items.forEach((item) => {
      const card = cards.find((row) => row.id === item.cardId);
      if (!card) return;
      const value = portfolioItemValue(item, card.latestSaleCny).current;
      const existing = values.get(card.player.cohort);
      values.set(card.player.cohort, {
        label: getPlayerCohortLabel(card.player),
        value: (existing?.value ?? 0) + value,
      });
    });
    return [...values.entries()]
      .map(([key, row]) => ({
        key,
        ...row,
        share: portfolioCurrentValue
          ? Math.round((row.value / portfolioCurrentValue) * 100)
          : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [cards, items, portfolioCurrentValue]);
  const coreShare = cohortDistribution
    .filter((item) => item.key === "core_rookie")
    .reduce((sum, item) => sum + item.share, 0);
  const recentShare = cohortDistribution
    .filter((item) => item.key === "recent_rookie")
    .reduce((sum, item) => sum + item.share, 0);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: PortfolioItem = {
      id: editing ?? `holding-${Date.now()}`,
      cardId: form.cardId,
      quantity: Number(form.quantity),
      purchasePrice: Number(form.purchasePrice),
      purchaseCurrency: "CNY",
      purchaseDate: form.purchaseDate,
      platform: form.platform,
      fees: 0,
      shipping: 0,
      tax: 0,
      gradingCost: 0,
      note: "",
      isPublic: form.isPublic,
    };
    setItems((current) =>
      editing
        ? current.map((item) => (item.id === editing ? next : item))
        : [...current, next],
    );
    setEditing(null);
    setForm((current) => ({
      ...current,
      quantity: "1",
      purchasePrice: "",
      isPublic: false,
    }));
  }
  function edit(item: PortfolioItem) {
    setEditing(item.id);
    setForm({
      cardId: item.cardId,
      quantity: String(item.quantity),
      purchasePrice: String(item.purchasePrice),
      purchaseDate: item.purchaseDate,
      platform: item.platform,
      isPublic: item.isPublic,
    });
  }

  return (
    <>
      <section className="portfolio-metrics terminal-portfolio-metrics">
        <button className="values-toggle" type="button" onClick={() => setValuesVisible((value) => !value)} aria-label={valuesVisible ? "隐藏资产数字" : "显示资产数字"}>{valuesVisible ? <EyeOff size={14} /> : <Eye size={14} />} {valuesVisible ? "隐藏数字" : "显示数字"}</button>
        <div>
          <span>总投入</span>
          <b>{valuesVisible ? "¥" + totals.cost.toLocaleString() : "***"}</b>
          <small>含费用和成本</small>
        </div>
        <div>
          <span>当前估值</span>
          <b>{valuesVisible ? "¥" + totals.current.toLocaleString() : "***"}</b>
          <small>基于演示成交中位价</small>
        </div>
        <div>
          <span>未实现盈亏</span>
          <b className={profit >= 0 ? "up" : "down"}>
            {valuesVisible ? (profit >= 0 ? "+" : "−") + "¥" + Math.abs(profit).toLocaleString() : "***"}
          </b>
          <small>
            {valuesVisible && totals.cost
              ? `${((profit / totals.cost) * 100).toFixed(1)}%`
              : "0%"}
          </small>
        </div>
        <div>
          <span>高风险占比</span>
          <b>
            {items.length
              ? Math.round(
                  (items.filter(
                    (item) =>
                      cards.find((card) => card.id === item.cardId)
                        ?.riskLevel === "high",
                  ).length /
                    items.length) *
                    100,
                )
              : 0}
            %
          </b>
          <small>按持仓条目计</small>
        </div>
      </section>
      <section
        className="data-panel cohort-allocation"
        data-testid="cohort-allocation"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">PLAYER COHORT ALLOCATION</span>
            <h2>持仓球员代际分布</h2>
          </div>
          <small>
            2025/2026 核心新秀 {coreShare}% · 2020—2024 近年新秀 {recentShare}%
          </small>
        </div>
        <div className="cohort-allocation-grid">
          {cohortDistribution.map((item) => (
            <article key={item.key}>
              <div>
                <span>{item.label}</span>
                <b>{item.share}%</b>
              </div>
              <i>
                <span style={{ width: `${item.share}%` }} />
              </i>
              <small>估值 ¥{item.value.toLocaleString()}</small>
            </article>
          ))}
          {!cohortDistribution.length && (
            <div className="empty-state">暂无持仓代际数据</div>
          )}
        </div>
      </section>
      <section className="portfolio-layout">
        <div className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">HOLDINGS</span>
              <h2>我的持仓</h2>
            </div>
            <small>{items.length} 个条目 · 仅存于当前浏览器</small>
          </div>
          <div className="holding-list">
            {items.map((item) => {
              const card = cards.find((row) => row.id === item.cardId);
              if (!card) return null;
              const value = portfolioItemValue(item, card.latestSaleCny);
              return (
                <article className="holding-row" key={item.id}>
                  <span className="mini-card">
                    {card.player.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div>
                    <b>{card.player.name}</b>
                    <small>
                      {card.releaseYear} {card.productLine} · {item.quantity} 张
                    </small>
                    <PlayerCohortBadges player={card.player} compact />
                  </div>
                  <div>
                    <span>投入</span>
                    <b>¥{value.cost.toLocaleString()}</b>
                  </div>
                  <div>
                    <span>估值</span>
                    <b>¥{value.current.toLocaleString()}</b>
                  </div>
                  <div>
                    <span>盈亏</span>
                    <b className={value.profit >= 0 ? "up" : "down"}>
                      {value.profit >= 0 ? "+" : ""}¥
                      {value.profit.toLocaleString()}
                    </b>
                  </div>
                  <span
                    className={`visibility-badge ${item.isPublic ? "public" : ""}`}
                  >
                    {item.isPublic ? "公开" : "私密"}
                  </span>
                  <div className="row-actions">
                    <button onClick={() => edit(item)}>编辑</button>
                    <button
                      className="danger"
                      onClick={() =>
                        setItems((current) =>
                          current.filter((row) => row.id !== item.id),
                        )
                      }
                    >
                      删除
                    </button>
                  </div>
                </article>
              );
            })}
            {!items.length && (
              <div className="empty-state">
                <b>尚未录入持仓</b>
                <span>使用右侧表单添加第一张卡片。</span>
              </div>
            )}
          </div>
        </div>
        <form className="data-panel holding-form" onSubmit={submit}>
          <div className="section-heading">
            <div>
              <span className="section-kicker">{editing ? "EDIT" : "ADD"}</span>
              <h2>{editing ? "编辑持仓" : "添加持仓"}</h2>
            </div>
          </div>
          <div className="form-body">
            <label>
              <span>卡片</span>
              <select
                required
                value={form.cardId}
                onChange={(event) =>
                  setForm({ ...form, cardId: event.target.value })
                }
              >
                {cards.map((card) => (
                  <option value={card.id} key={card.id}>
                    {card.player.name} · {card.productLine}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-two">
              <label>
                <span>数量</span>
                <input
                  required
                  min="1"
                  type="number"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm({ ...form, quantity: event.target.value })
                  }
                />
              </label>
              <label>
                <span>买入价 CNY</span>
                <input
                  required
                  min="0"
                  type="number"
                  value={form.purchasePrice}
                  onChange={(event) =>
                    setForm({ ...form, purchasePrice: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              <span>买入日期</span>
              <input
                required
                type="date"
                value={form.purchaseDate}
                onChange={(event) =>
                  setForm({ ...form, purchaseDate: event.target.value })
                }
              />
            </label>
            <label>
              <span>购买平台</span>
              <input
                required
                value={form.platform}
                onChange={(event) =>
                  setForm({ ...form, platform: event.target.value })
                }
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(event) =>
                  setForm({ ...form, isPublic: event.target.checked })
                }
              />
              <span>允许在公开收藏主页展示（默认关闭）</span>
            </label>
            <button className="button button-primary" type="submit">
              {editing ? "保存修改" : "添加持仓"}
            </button>
            {editing && (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setEditing(null)}
              >
                取消编辑
              </button>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
