import Link from "next/link";
import { Activity, ArrowDownRight, ArrowUpRight, Clock3, ShieldAlert } from "lucide-react";

const heatmap = [
  ["Cooper Flagg", "+12.8%", "xl", "strong"],
  ["Victor Wembanyama", "+7.4%", "lg", "up"],
  ["Dylan Harper", "+5.9%", "md", "up"],
  ["Ace Bailey", "−4.6%", "md", "down"],
  ["Luka Dončić", "+2.1%", "sm", "up"],
  ["LeBron James", "−1.8%", "sm", "down"],
  ["C. Cunningham", "+3.4%", "sm", "up"],
  ["S. Henderson", "−3.1%", "sm", "down"],
] as const;

const gainers = [
  ["Cooper Flagg", "2025 Topps Chrome RC", "¥8,420", "+12.8%"],
  ["Victor Wembanyama", "2023 Prizm Silver RC", "¥6,780", "+7.4%"],
  ["Dylan Harper", "2025 Topps Basketball RC", "¥2,160", "+5.9%"],
];
const losers = [
  ["Ace Bailey", "2025 Finest Gold /50", "¥3,350", "−4.6%"],
  ["Scoot Henderson", "2023 Select Courtside", "¥1,080", "−3.1%"],
  ["LeBron James", "2003 Topps Chrome", "¥31,600", "−1.8%"],
];
const active = [
  ["Victor Wembanyama", "Prizm Silver RC", "184", "¥1.26M"],
  ["Cooper Flagg", "Topps Chrome RC", "162", "¥1.12M"],
  ["Luka Dončić", "Optic Holo RC", "98", "¥724K"],
];

function RankingList({ rows, tone }: { rows: string[][]; tone: "up" | "down" | "active" }) {
  return <div className="terminal-ranking-list">
    {rows.map((row, index) => <Link href="/market" className="terminal-ranking-row" key={row[0]}>
      <span className="terminal-rank">{String(index + 1).padStart(2, "0")}</span>
      <span className="terminal-avatar">{row[0].split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
      <span className="terminal-player"><b>{row[0]}</b><small>{row[1]}</small></span>
      <span className="terminal-price"><b>{row[2]}</b><small>{tone === "active" ? row[3] : "最新成交"}</small></span>
      {tone !== "active" && <span className={`terminal-change ${tone}`}>{row[3]}</span>}
    </Link>)}
  </div>;
}

export default function Home() {
  return <main className="page-shell terminal-dashboard">
    <header className="terminal-page-heading">
      <div><span className="section-kicker">MARKET OVERVIEW</span><h1>市场总览</h1><p>NBA 球星卡二级市场成交、流动性与风险监控</p></div>
      <div className="updated-at"><Clock3 size={14} aria-hidden /><span>数据更新于</span><b>2026-09-02 09:30 CST</b></div>
    </header>
    <section className="terminal-hero-intent data-panel">
      <div><span className="section-kicker">COLLECTOR INTELLIGENCE</span><h2>帮助收藏者区分真实成交、在售标价和风险信号</h2><p>把分散的市场数据整理成清晰、可核验的观察线索，不把演示数据包装成实时行情。</p></div>
      <div className="terminal-hero-actions">
        <Link className="primary" href="/market">搜索一张卡 <span>→</span></Link>
        <Link href="/market#rankings">查看涨跌榜 <span>→</span></Link>
        <Link href="/portfolio">管理我的持仓 <span>→</span></Link>
      </div>
    </section>
    <div className="terminal-demo-notice"><span>演示数据 · 非实时行情</span><small>价格旁显示样本数量、更新时间和来源；样本不足时不生成可靠趋势。</small><Link href="/methodology">了解可信度规则 →</Link></div>

    <section className="terminal-summary-grid" aria-label="今日市场概览">
      <article><span>今日总成交额</span><strong>¥18,642,380</strong><small className="up"><ArrowUpRight size={13} /> 6.82% 较昨日</small></article>
      <article><span>活跃卡片</span><strong>1,248</strong><small className="neutral">覆盖 18 个数据来源</small></article>
      <article><span>上涨 / 下跌</span><strong><i className="up">684</i> / <i className="down">392</i></strong><small className="neutral">64.6% 市场宽度</small></article>
      <article><span>市场热度指数</span><strong>78.4</strong><small className="up"><ArrowUpRight size={13} /> 4.2 pts · 偏热</small></article>
    </section>

    <section className="terminal-dashboard-grid">
      <article className="data-panel terminal-heatmap-panel">
        <div className="terminal-panel-heading"><div><span className="section-kicker">TODAY&apos;S HEATMAP</span><h2>今日热力图</h2></div><div className="heatmap-legend"><span><i className="up" />上涨</span><span><i className="down" />下跌</span></div></div>
        <div className="terminal-heatmap">
          {heatmap.map(([name, change, size, tone]) => <Link href="/market" className={`heatmap-cell ${size} ${tone}`} key={name}><b>{name}</b><span>{change}</span><small>成交活跃度</small></Link>)}
        </div>
      </article>

      <article className="data-panel terminal-activity-panel">
        <div className="terminal-panel-heading"><div><span className="section-kicker">LIQUIDITY</span><h2>成交活跃榜</h2></div><Link href="/market">完整榜单 →</Link></div>
        <RankingList rows={active} tone="active" />
        <div className="panel-footnote"><Activity size={13} /> 按近 24 小时可信成交笔数排序</div>
      </article>
    </section>

    <section className="terminal-ranking-grid">
      <article className="data-panel"><div className="terminal-panel-heading"><div><span className="section-kicker">TOP GAINERS</span><h2><ArrowUpRight className="up" size={18} /> 涨幅榜</h2></div><Link href="/market">查看全部</Link></div><RankingList rows={gainers} tone="up" /></article>
      <article className="data-panel"><div className="terminal-panel-heading"><div><span className="section-kicker">TOP LOSERS</span><h2><ArrowDownRight className="down" size={18} /> 跌幅榜</h2></div><Link href="/market">查看全部</Link></div><RankingList rows={losers} tone="down" /></article>
    </section>

    <Link href="/alerts" className="terminal-risk-ticker"><span><ShieldAlert size={16} /> 风险提醒</span><b>伤病风险上升：3 位关注球员出现新增伤病事件</b><small>查看风险详情 →</small></Link>
  </main>;
}
