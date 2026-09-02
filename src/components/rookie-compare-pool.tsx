"use client";

import { useState } from "react";
import type { Card, Player } from "@/types/domain";

export function RookieComparePool({ players }: { players: Player[]; cards: Card[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 5 ? [...current, id] : current);
  const chosen = players.filter((player) => selected.includes(player.id));
  const metrics: Array<[string, (player: Player) => number]> = [["得分", (p) => p.points], ["篮板", (p) => p.rebounds], ["上场时间", (p) => p.minutes], ["热度指数", (p) => p.marketHeat]];
  return (
    <section className="data-panel rookie-pool">
      <div className="section-heading"><div><span className="section-kicker">COMPARE POOL · 2—5 PLAYERS</span><h2>新秀横向对比</h2></div><small>勾选球员后生成对比表</small></div>
      <div className="rookie-pool-list">{players.map((player) => <label key={player.id}><input type="checkbox" checked={selected.includes(player.id)} onChange={() => toggle(player.id)} /><span>{player.displayNameZh}</span><small>{player.name}</small></label>)}</div>
      {chosen.length > 0 ? <div className="rookie-compare-table table-wrap"><table><thead><tr><th>维度</th>{chosen.map((player) => <th key={player.id}>{player.displayNameZh}</th>)}</tr></thead><tbody>{metrics.map(([label, get]) => <tr key={label}><th>{label}</th>{chosen.map((player) => <td className="mono" key={player.id}>{get(player)}</td>)}</tr>)}</tbody></table></div> : <div className="empty-state rookie-pool-empty"><b>请选择 2—5 位新秀</b><span>对比得分、篮板、上场时间与热度指数。</span></div>}
    </section>
  );
}
