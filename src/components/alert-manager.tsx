"use client";

import { useState } from "react";
import type { AlertRule, Card, Player } from "@/types/domain";

const alertLabels: Record<AlertRule["type"], string> = {
  price_above: "价格高于目标",
  price_below: "价格低于目标",
  daily_change: "单日涨跌",
  volume_spike: "成交量异动",
  new_sale: "新增成交",
  injury: "伤病更新",
  return: "复出更新",
  trade_rumor: "交易流言",
  signing: "签约动态",
  cohort_change: "球员代际变化",
  profit_target: "止盈目标",
  loss_threshold: "亏损阈值",
};

export function AlertManager({
  seed,
  cards,
}: {
  seed: AlertRule[];
  cards: Array<Card & { player: Player }>;
}) {
  const [rules, setRules] = useState(seed);
  const [notice, setNotice] = useState("");
  function triggerDemo() {
    setRules((current) =>
      current.map((rule, index) =>
        index === 0
          ? {
              ...rule,
              triggered: true,
              lastTriggeredAt: new Date().toISOString(),
            }
          : rule,
      ),
    );
    setNotice("已触发一条演示提醒。真实推送服务尚未接入。");
  }
  return (
    <section className="alerts-layout">
      <div className="data-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">RULES</span>
            <h2>提醒规则</h2>
          </div>
          <button
            className="button button-secondary compact"
            onClick={triggerDemo}
          >
            触发演示提醒
          </button>
        </div>
        {notice && <div className="inline-notice">{notice}</div>}
        <div className="alert-list">
          {rules.map((rule) => {
            const card = cards.find((item) => item.id === rule.cardId);
            return (
              <article className="alert-row" key={rule.id}>
                <span
                  className={`alert-status ${rule.triggered ? "triggered" : ""}`}
                  aria-hidden
                >
                  {rule.triggered ? "!" : "○"}
                </span>
                <div>
                  <b>{card?.player.name ?? "未知卡片"}</b>
                  <small>
                    {alertLabels[rule.type]}{" "}
                    {rule.threshold ? `· 阈值 ${rule.threshold}` : ""}
                  </small>
                </div>
                <span
                  className={
                    rule.triggered ? "risk-pill high" : "risk-pill low"
                  }
                >
                  {rule.triggered ? "已触发" : "监控中"}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() =>
                      setRules((current) =>
                        current.map((item) =>
                          item.id === rule.id
                            ? { ...item, enabled: !item.enabled }
                            : item,
                        ),
                      )
                    }
                  />
                  <span />
                </label>
              </article>
            );
          })}
        </div>
      </div>
      <aside className="data-panel notification-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">INBOX</span>
            <h2>站内通知</h2>
          </div>
        </div>
        <article>
          <span>价格异动</span>
          <b>Victor Wembanyama Prizm Silver 7 日上涨 7.4%</b>
          <small>09:25 · 演示数据</small>
        </article>
        <article>
          <span>数据风险</span>
          <b>Ace Bailey Finest Gold 近 30 日仅 3 笔成交</b>
          <small>08:40 · 样本不足提示</small>
        </article>
        <article>
          <span>交易热点</span>
          <b>Brandon Miller 交易流言标签进入演示监控</b>
          <small>09:05 · 未接入真实新闻源</small>
        </article>
        <article>
          <span>签约动态</span>
          <b>Derrick White 签约热点标签发生演示更新</b>
          <small>08:55 · 演示数据</small>
        </article>
        <article>
          <span>伤病观察</span>
          <b>关注球员状态发生演示更新</b>
          <small>昨日 · 不构成医学判断</small>
        </article>
      </aside>
    </section>
  );
}
