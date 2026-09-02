"use client";

import { useMemo, useState } from "react";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import type { Card, Player } from "@/types/domain";

const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export function RookieComparison({
  players,
  cards,
}: {
  players: Player[];
  cards: Card[];
}) {
  const [selectedYears, setSelectedYears] = useState([2023, 2024, 2025]);
  const comparison = useMemo(
    () =>
      selectedYears.map((year) => {
        const candidates = players
          .filter((player) => player.draftYear === year)
          .sort((a, b) => b.marketHeat - a.marketHeat);
        const player = candidates[0];
        return {
          year,
          player,
          card: player
            ? cards.find((item) => item.playerId === player.id)
            : undefined,
        };
      }),
    [cards, players, selectedYears],
  );

  return (
    <section className="cross-year-comparison data-panel">
      <div className="section-heading comparison-heading">
        <div>
          <span className="section-kicker">CROSS-CLASS COMPARE</span>
          <h2>跨年份新秀对比</h2>
          <p>默认对比 2023、2024 与 2025 届，可切换至 2020—2026 任意年份。</p>
        </div>
        <div className="comparison-selects" aria-label="选择对比年份">
          {selectedYears.map((selected, index) => (
            <label key={`${index}-${selected}`}>
              <span>年份 {index + 1}</span>
              <select
                aria-label={`对比年份 ${index + 1}`}
                value={selected}
                onChange={(event) =>
                  setSelectedYears((current) =>
                    current.map((value, itemIndex) =>
                      itemIndex === index ? Number(event.target.value) : value,
                    ),
                  )
                }
              >
                {years.map((year) => (
                  <option value={year} key={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
      <div className="cross-year-grid">
        {comparison.map(({ year, player, card }, index) => (
          <article key={`${year}-${index}`}>
            <span className="year-tag">{year}</span>
            {player ? (
              <>
                <h3>{player.displayNameZh}</h3>
                <small>{player.name}</small>
                <PlayerCohortBadges player={player} compact />
                <dl>
                  <div>
                    <dt>表现</dt>
                    <dd>{player.points} PTS</dd>
                  </div>
                  <div>
                    <dt>热度</dt>
                    <dd>{player.marketHeat}/100</dd>
                  </div>
                  <div>
                    <dt>成交</dt>
                    <dd>{card?.sales30d ?? 0} 笔</dd>
                  </div>
                  <div>
                    <dt>完整度</dt>
                    <dd>{card?.dataCompleteness ?? 0}%</dd>
                  </div>
                </dl>
                <p>{player.peerComparison ?? "暂无同届对比摘要。"}</p>
              </>
            ) : (
              <div className="empty-state">
                <b>该届暂无演示球员</b>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
