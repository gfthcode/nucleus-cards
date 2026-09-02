import type { Metadata } from "next";
import { CsvImporter } from "@/components/csv-importer";
import { PageHeader } from "@/components/page-header";
import { PlayerBatchManager } from "@/components/player-batch-manager";
import { cards, dataSources, players, teams } from "@/lib/demo-data";

export const metadata: Metadata = { title: "管理后台" };
const modules = [
  ["球队", teams.length, "管理基础资料"],
  ["球员", players.length, "含现役、历史与选秀届"],
  ["卡片", cards.length, "标准化身份与版本"],
  ["选秀届", 7, "2020—2026 批量覆盖"],
  ["球员代际", 6, "核心至退役传奇"],
  ["审核队列", 4, "社区提交与异常成交"],
  ["导入任务", 2, "CSV 与适配器任务"],
  ["AI 分析", 7, "确定性演示任务"],
];
export default function AdminPage() {
  return (
    <main className="page-shell inner-page admin-page">
      <PageHeader
        eyebrow="ADMIN · DEMO ROLE"
        title="数据管理后台"
        description="演示模式允许直接进入。生产模式必须由 Supabase 用户角色和服务端策略授权，不使用硬编码管理员密码。"
      />
      <div className="admin-warning">
        <b>演示管理员</b>
        <span>当前所有修改控件均为本地演示，不会写入远程数据库。</span>
      </div>
      <section className="admin-module-grid">
        {modules.map(([name, count, note]) => (
          <article key={String(name)}>
            <span>{name}</span>
            <b>{count}</b>
            <small>{note}</small>
            <button>进入管理</button>
          </article>
        ))}
      </section>
      <PlayerBatchManager seed={players} />
      <div className="admin-content-grid">
        <section className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">IMPORT</span>
              <h2>导入 CSV 成交记录</h2>
            </div>
            <a href="/templates/sales-import-template.csv" download>
              下载模板
            </a>
          </div>
          <CsvImporter />
          <div className="import-rules">
            <h3>导入规则</h3>
            <ul>
              <li>校验稳定身份键、币种、来源和成交时间。</li>
              <li>组合交易不会直接计入单卡价格。</li>
              <li>异常值进入审核队列，不删除原始记录。</li>
              <li>社区记录始终保留来源标签。</li>
            </ul>
          </div>
        </section>
        <section className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">SOURCE HEALTH</span>
              <h2>数据源健康状态</h2>
            </div>
          </div>
          <div className="source-health-list">
            {dataSources.map((source) => (
              <article key={source.id}>
                <span className={`health-dot ${source.enabled ? "on" : ""}`} />
                <div>
                  <b>{source.name}</b>
                  <small>
                    {source.error ?? `上次同步 ${source.lastSyncAt}`}
                  </small>
                </div>
                <em>{source.enabled ? "可用" : "未启用"}</em>
              </article>
            ))}
          </div>
        </section>
      </div>
      <section className="data-panel">
        <div className="section-heading">
          <div>
            <span className="section-kicker">AUDIT LOG</span>
            <h2>审计日志</h2>
          </div>
          <small>只读演示</small>
        </div>
        <div className="audit-list">
          <article>
            <code>09:30:12</code>
            <b>system.demo_sync</b>
            <span>刷新演示价格快照</span>
            <em>success</em>
          </article>
          <article>
            <code>09:22:44</code>
            <b>review.flag_outlier</b>
            <span>sale-5 标记为价格异常</span>
            <em>reviewed</em>
          </article>
          <article>
            <code>08:55:03</code>
            <b>ai.generate</b>
            <span>生成 7 张卡片结构化分析</span>
            <em>success</em>
          </article>
        </div>
      </section>
    </main>
  );
}
