"use client";

import { useMemo, useState } from "react";
import { PlayerCohortBadges } from "@/components/player-cohort-badges";
import type { Player, PlayerCohort } from "@/types/domain";

const cohortOptions: Array<{ value: PlayerCohort; label: string }> = [
  { value: "core_rookie", label: "核心新秀" },
  { value: "recent_rookie", label: "近年新秀" },
  { value: "young_core", label: "年轻核心" },
  { value: "prime", label: "当打球员" },
  { value: "veteran", label: "老将" },
  { value: "retired_legend", label: "退役传奇" },
];

export function PlayerBatchManager({ seed }: { seed: Player[] }) {
  const [rows, setRows] = useState(seed);
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<string>("recent_rookie");
  const [notice, setNotice] = useState("");
  const managed = useMemo(
    () =>
      rows.filter(
        (player) =>
          (player.draftYear >= 2020 && player.draftYear <= 2026) ||
          player.isRolePlayer,
      ),
    [rows],
  );

  function togglePlayer(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function applyBatch() {
    if (!selected.length) {
      setNotice("请至少选择一位球员。");
      return;
    }
    setRows((current) =>
      current.map((player) => {
        if (!selected.includes(player.id)) return player;
        if (action.startsWith("toggle:")) {
          const field = action.slice(7) as
            "isRolePlayer" | "isTradeHot" | "isSigningHot";
          return { ...player, [field]: !player[field] };
        }
        return {
          ...player,
          cohort: action as PlayerCohort,
          isCoreRookie: action === "core_rookie",
        };
      }),
    );
    setNotice(`已在本地演示中更新 ${selected.length} 位球员。`);
  }

  return (
    <section className="data-panel player-batch-manager">
      <div className="section-heading">
        <div>
          <span className="section-kicker">BATCH PLAYER MANAGEMENT</span>
          <h2>2020—2026 与角色球员批量管理</h2>
        </div>
        <small>{managed.length} 位可管理演示球员</small>
      </div>
      <div className="batch-toolbar">
        <label>
          <span>批量动作</span>
          <select
            value={action}
            onChange={(event) => setAction(event.target.value)}
          >
            <optgroup label="设置球员代际">
              {cohortOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="切换热点标签">
              <option value="toggle:isRolePlayer">切换角色球员</option>
              <option value="toggle:isTradeHot">切换交易热点</option>
              <option value="toggle:isSigningHot">切换签约热点</option>
            </optgroup>
          </select>
        </label>
        <button className="button button-primary compact" onClick={applyBatch}>
          应用至 {selected.length} 位球员
        </button>
        <button
          className="button button-secondary compact"
          onClick={() =>
            setSelected(
              selected.length === managed.length
                ? []
                : managed.map((player) => player.id),
            )
          }
        >
          {selected.length === managed.length ? "取消全选" : "全选"}
        </button>
      </div>
      {notice && <div className="inline-notice">{notice}</div>}
      <div className="batch-player-grid">
        {managed.map((player) => (
          <label
            key={player.id}
            className={selected.includes(player.id) ? "selected" : ""}
          >
            <input
              type="checkbox"
              checked={selected.includes(player.id)}
              onChange={() => togglePlayer(player.id)}
            />
            <span>
              <b>{player.displayNameZh}</b>
              <small>
                {player.draftYear} · {player.position}
              </small>
              <PlayerCohortBadges player={player} compact />
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
