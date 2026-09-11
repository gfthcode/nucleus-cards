import Link from "next/link";
import { Activity, ArrowDownRight, ArrowUpRight, Clock3, ShieldAlert } from "lucide-react";
import { ImmersiveHomeHero } from "@/components/immersive-home-hero";
import { cards, getCardSales, getPlayer } from "@/lib/demo-data";
import { calculateMarketReference } from "@/lib/market-math";

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

const heroPhotos = {
  "2": { url: "https://cdn.nba.com/logos/nba/nba-logoman-75-word_white.svg", sourceUrl: "https://www.nba.com", sourceName: "NBA.com 官方 Logo", isLogo: true },
  "19": { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Shai%20Gilgeous-Alexander%20%2851815871018%29%20%28cropped%29.jpg", sourceUrl: "https://commons.wikimedia.org/wiki/File:Shai_Gilgeous-Alexander_(51815871018)_(cropped).jpg", sourceName: "Wikimedia Commons" },
  "20": { url: "https://commons.wikimedia.org/wiki/Special:FilePath/LeBron%20James%2018112009%201.jpg", sourceUrl: "https://commons.wikimedia.org/wiki/File:LeBron_James_18112009_1.jpg", sourceName: "Wikimedia Commons" },
  "21": { url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Jalen_Williams_OKCThunder_2025_NBA_Cup_%28cropped%29_%28cropped%29.jpg", sourceUrl: "https://commons.wikimedia.org/wiki/File:Jalen_Williams_OKCThunder_2025_NBA_Cup_(cropped)_(cropped).jpg", sourceName: "Wikimedia Commons · CC BY 4.0" },
} as const;

function RankingList({ rows, tone }: { rows: string[][]; tone: "up" | "down" | "active" }) {
  return <div className="terminal-ranking-list">
    {rows.map((row, index) => <Link href={`/market?q=${encodeURIComponent(row[0])}`} className="terminal-ranking-row" key={row[0]}>
      <span className="terminal-rank">{String(index + 1).padStart(2, "0")}</span>
      <span className="terminal-avatar">{row[0].split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
      <span className="terminal-player"><b>{row[0]}</b><small>{row[1]}</small></span>
      <span className="terminal-price"><b>{row[2]}</b><small>{tone === "active" ? row[3] : "最新成交"}</small></span>
      {tone !== "active" && <span className={`terminal-change ${tone}`}>{row[3]}</span>}
    </Link>)}
  </div>;
}

export default function Home() {
  const heroSlides = ["2", "19", "20", "21"].flatMap((cardId) => {
    const card = cards.find((item) => item.id === cardId);
    const player = card ? getPlayer(card.playerId) : undefined;
    return card && player
      ? [{ card, player, reference: calculateMarketReference(getCardSales(card.id)), photo: heroPhotos[card.id as keyof typeof heroPhotos] }]
      : [];
  });

  if (!heroSlides.length) {
    return null;
  }

  return <main className="page-shell terminal-dashboard">
    <ImmersiveHomeHero slides={heroSlides} />
    <nav className="home-anchor-nav" aria-label="首页快捷导航">
      <span className="home-anchor-brand">Nucleus / NBA Cards</span>
      <div><a href="#overview">总览</a><a href="#market">市场</a><a href="#auction">拍卖雷达</a><a href="#methodology">数据口径</a></div>
      <Link className="home-anchor-cta" href="/market">开始检索 <span>→</span></Link>
    </nav>
    <header className="terminal-page-heading" id="overview">
      <div><span className="section-kicker">MARKET OVERVIEW</span><h1>市场总览</h1><p>NBA 球星卡二级市场成交、流动性与风险监控</p></div>
      <div className="updated-at"><Clock3 size={14} aria-hidden /><span>数据状态</span><b>演示快照 · 2026-09-09</b></div>
    </header>
    <section className="terminal-hero-intent data-panel">
      <div><span className="section-kicker">COLLECTOR INTELLIGENCE</span><h2>帮助收藏者区分真实成交、在售标价和风险信号</h2><p>把分散的市场数据整理成清晰、可核验的观察线索，不把演示数据包装成实时行情。</p></div>
      <div className="terminal-hero-actions">
        <Link className="primary" href="/market">搜索一张卡 <span>→</span></Link>
        <Link href="/market#rankings">查看涨跌榜 <span>→</span></Link>
        <Link href="/portfolio">管理我的持仓 <span>→</span></Link>
      </div>
    </section>
    <section className="home-highlights" aria-label="平台能力">
      {[
        ["01", "市场检索", "按球员、品牌、年份定位卡片", "/market"],
        ["02", "拍卖雷达", "追踪挂牌与拍卖机会", "/auction-radar"],
        ["03", "球队与球员", "从 NBA 阵容进入球员档案", "/teams"],
        ["04", "可信口径", "查看来源、样本与更新时间", "/methodology"],
      ].map(([index, title, description, href]) => <Link href={href} key={title} className="home-highlight-card"><b>{index}</b><span><strong>{title}</strong><small>{description}</small></span><i>↗</i></Link>)}
    </section>
    <div className="terminal-demo-notice"><span>演示数据 · 非实时行情</span><small>价格旁显示样本数量、更新时间和来源；样本不足时不生成可靠趋势。</small><Link href="/methodology">了解可信度规则 →</Link></div>
    <section className="terminal-start-guide data-panel" id="methodology" aria-label="快速开始"><div><span className="section-kicker">QUICK START</span><h2>第一次使用？三步找到可核验线索</h2></div><div className="start-guide-steps"><Link href="/market"><b>01</b><span>搜索卡片<small>按球员、品牌、年份筛选</small></span></Link><Link href="/auction-radar"><b>02</b><span>核对来源<small>区分成交、挂牌与拍卖</small></span></Link><Link href="/methodology"><b>03</b><span>阅读口径<small>了解 Heat、流动性与样本限制</small></span></Link></div></section>

    <section className="terminal-summary-grid" aria-label="今日市场概览">
      <article><span>今日总成交额</span><strong>¥18,642,380</strong><small className="up"><ArrowUpRight size={13} /> 6.82% 较昨日</small></article>
      <article><span>演示卡片</span><strong>1,248</strong><small className="neutral">产品功能样本，不代表全市场覆盖</small></article>
      <article><span>上涨 / 下跌</span><strong><i className="up">684</i> / <i className="down">392</i></strong><small className="neutral">64.6% 市场宽度</small></article>
      <article><span>市场热度指数</span><strong>78.4</strong><small className="up"><ArrowUpRight size={13} /> 4.2 pts · 偏热</small></article>
    </section>

    <section className="terminal-dashboard-grid" id="market">
      <article className="data-panel terminal-heatmap-panel">
        <div className="terminal-panel-heading"><div><span className="section-kicker">TODAY&apos;S HEATMAP</span><h2>今日热力图</h2></div><div className="heatmap-legend"><span><i className="up" />上涨</span><span><i className="down" />下跌</span></div></div>
        <div className="terminal-heatmap">
          {heatmap.map(([name, change, size, tone]) => <Link href={`/market?q=${encodeURIComponent(name)}`} className={`heatmap-cell ${size} ${tone}`} key={name}><b>{name}</b><span>{change}</span><small>成交活跃度 · 点击查看样本</small></Link>)}
        </div>
      </article>

      <article className="data-panel terminal-activity-panel" id="auction">
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
