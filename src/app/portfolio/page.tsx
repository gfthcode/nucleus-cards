import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PortfolioManager } from "@/components/portfolio-manager";
import { cards, demoPortfolio, getPlayer } from "@/lib/demo-data";

export const metadata: Metadata = { title: "我的持仓" };

export default function PortfolioPage() {
  const joined = cards.map((card) => ({
    ...card,
    player: getPlayer(card.playerId)!,
  }));
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow="PRIVATE PORTFOLIO"
        title="我的持仓"
        description="录入数量、买入价与成本，查看估值、未实现盈亏、集中度与球员代际分布。演示模式仅在当前浏览器本地保存。"
        actions={
          <Link className="button button-secondary" href="/collections/demo">
            查看公开收藏页
          </Link>
        }
      />
      <div className="privacy-callout">
        <b>默认隐私保护已开启</b>
        <span>
          真实姓名、联系方式、购买成本、盈亏和精确资产总额不会公开；只有明确开启的卡片会进入公开主页。
        </span>
      </div>
      <PortfolioManager seed={demoPortfolio} cards={joined} />
      <section className="concentration-grid">
        <article className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CONCENTRATION</span>
              <h2>集中度</h2>
            </div>
          </div>
          <div className="donut-row">
            <div className="css-donut" />
            <ul>
              <li>
                <i style={{ background: "#4d8dff" }} />
                Topps <b>36%</b>
              </li>
              <li>
                <i style={{ background: "#8c6ee8" }} />
                Panini <b>50%</b>
              </li>
              <li>
                <i style={{ background: "#3fc98a" }} />
                历史品牌 <b>14%</b>
              </li>
            </ul>
          </div>
        </article>
        <article className="data-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">WARNINGS</span>
              <h2>组合风险</h2>
            </div>
          </div>
          <div className="risk-detail-list">
            <article>
              <b>球员集中度</b>
              <span>最大单一球员占演示估值约 45%。</span>
            </article>
            <article>
              <b>代际集中度</b>
              <span>核心新秀、近年新秀与年轻核心按当前估值动态计算。</span>
            </article>
            <article>
              <b>低流动性卡片</b>
              <span>高端 RPA 成交稀疏，估值误差可能较大。</span>
            </article>
          </div>
        </article>
      </section>
    </main>
  );
}
