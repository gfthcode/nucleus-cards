"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import type { Card, Player, Team } from "@/types/domain";

type MarketRow = Card & { player: Player; team?: Team };

export function MarketExplorer({ rows }: { rows: MarketRow[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [draftYear, setDraftYear] = useState("all");
  const [cohort, setCohort] = useState("all");
  const [spotlight, setSpotlight] = useState("all");
  const [risk, setRisk] = useState("all");
  const [sort, setSort] = useState("latest");

  const filtered = useMemo(
    () =>
      rows
        .filter((row) => {
          const haystack =
            `${row.player.name} ${row.player.displayNameZh} ${row.brand} ${row.productLine} ${row.team?.name ?? ""}`.toLowerCase();
          return (
            haystack.includes(query.toLowerCase()) &&
            (brand === "all" || row.brand === brand) &&
            (draftYear === "all" || row.draftYear === Number(draftYear)) &&
            (cohort === "all" || row.player.cohort === cohort) &&
            (spotlight === "all" ||
              (spotlight === "core" && row.player.isCoreRookie) ||
              (spotlight === "role" && row.player.isRolePlayer) ||
              (spotlight === "trade" && row.player.isTradeHot) ||
              (spotlight === "signing" && row.player.isSigningHot)) &&
            (risk === "all" || row.riskLevel === risk)
          );
        })
        .sort((a, b) =>
          sort === "change30d"
            ? (b.change30d ?? -999) - (a.change30d ?? -999)
            : sort === "volume"
              ? b.sales30d - a.sales30d
              : sort === "liquidity"
                ? b.liquidity - a.liquidity
                : sort === "draftYear"
                  ? b.player.draftYear - a.player.draftYear
                  : sort === "age"
                    ? a.player.age - b.player.age
                    : (b.latestSaleCny ?? -1) - (a.latestSaleCny ?? -1),
        ),
    [rows, query, brand, draftYear, cohort, spotlight, risk, sort],
  );

  return (
    <>
      <section className="filter-bar" aria-label="行情筛选">
        <label className="search-field">
          <span>搜索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="球员、球队、品牌或系列"
          />
        </label>
        <label>
          <span>品牌</span>
          <select
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          >
            <option value="all">全部品牌</option>
            <option>Topps</option>
            <option>Panini</option>
            <option>Upper Deck</option>
          </select>
        </label>
        <label>
          <span>选秀届</span>
          <select
            value={draftYear}
            onChange={(event) => setDraftYear(event.target.value)}
          >
            <option value="all">全部年份</option>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>球员代际</span>
          <select
            value={cohort}
            onChange={(event) => setCohort(event.target.value)}
          >
            <option value="all">全部代际</option>
            <option value="core_rookie">核心新秀</option>
            <option value="recent_rookie">近年新秀</option>
            <option value="young_core">年轻核心</option>
            <option value="prime">当打球员</option>
            <option value="veteran">老将</option>
            <option value="retired_legend">退役传奇</option>
          </select>
        </label>
        <label>
          <span>热点</span>
          <select
            value={spotlight}
            onChange={(event) => setSpotlight(event.target.value)}
          >
            <option value="all">全部热点</option>
            <option value="core">2025/2026 核心新秀</option>
            <option value="role">角色球员</option>
            <option value="trade">交易热点</option>
            <option value="signing">签约热点</option>
          </select>
        </label>
        <label>
          <span>风险</span>
          <select
            value={risk}
            onChange={(event) => setRisk(event.target.value)}
          >
            <option value="all">全部等级</option>
            <option value="low">低风险</option>
            <option value="medium">中风险</option>
            <option value="high">高风险</option>
          </select>
        </label>
        <label>
          <span>排序</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="latest">最新成交价</option>
            <option value="change30d">30 日涨跌</option>
            <option value="volume">成交量</option>
            <option value="liquidity">流动性</option>
            <option value="draftYear">选秀年份</option>
            <option value="age">球员年龄</option>
          </select>
        </label>
      </section>
      <div className="result-meta">
        <span>
          找到 <b>{filtered.length}</b> 张标准化卡片
        </span>
        <small>真实成交与在售标价分列显示</small>
      </div>
      <section className="market-table data-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>标准化卡片</th>
                <th>属性</th>
                <th>最新真实成交</th>
                <th>当前在售标价</th>
                <th>30 日</th>
                <th>成交 / 流动性</th>
                <th>风险</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link
                      className="market-card-link"
                      href={`/cards/${row.id}`}
                    >
                      <span className="mini-card">
                        {row.player.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span>
                        <b>{row.player.name}</b>
                        <small>
                          {row.releaseYear} {row.productLine} {row.cardNumber}
                        </small>
                        <PlayerCohortBadges player={row.player} compact />
                      </span>
                    </Link>
                  </td>
                  <td>
                    <span className="tag-row">
                      <i>{row.rookie ? "RC" : "非 RC"}</i>
                      <i>{row.parallel}</i>
                      <i>
                        {row.condition === "graded"
                          ? `${row.gradingCompany} ${row.grade}`
                          : "裸卡"}
                      </i>
                    </span>
                  </td>
                  <td>
                    {row.latestSaleCny ? (
                      <>
                        <b>¥{row.latestSaleCny.toLocaleString()}</b>
                        <small>{row.sales30d} 笔可信样本</small>
                      </>
                    ) : (
                      <span className="no-data">暂无可信成交数据</span>
                    )}
                  </td>
                  <td>
                    {row.latestListingCny ? (
                      <>
                        <b>¥{row.latestListingCny.toLocaleString()}</b>
                        <small>在售标价 · 非成交</small>
                      </>
                    ) : (
                      <span className="no-data">暂无在售</span>
                    )}
                  </td>
                  <td className={(row.change30d ?? 0) >= 0 ? "up" : "down"}>
                    {row.change30d == null
                      ? "—"
                      : `${row.change30d > 0 ? "+" : ""}${row.change30d}%`}
                  </td>
                  <td>
                    <b>
                      {row.sales30d} / {row.liquidity}
                    </b>
                    <small>30 日成交 / 100</small>
                  </td>
                  <td>
                    <span className={`risk-pill ${row.riskLevel}`}>
                      {row.riskLevel === "low"
                        ? "低"
                        : row.riskLevel === "medium"
                          ? "中"
                          : "高"}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <b>没有匹配结果</b>
                      <span>调整关键词或筛选条件后重试。</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
