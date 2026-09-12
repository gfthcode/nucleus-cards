import Link from "next/link";
import type { Metadata } from "next";
import { PortfolioManager } from "@/components/portfolio-manager";
import { cards, demoPortfolio, getPlayer } from "@/lib/demo-data";
import styles from "./portfolio.module.css";

export const metadata: Metadata = { title: "我的持仓" };

export default function PortfolioPage() {
  const joined = cards.map((card) => ({
    ...card,
    player: getPlayer(card.playerId)!,
  }));
  return (
    <main className={`${styles.page} page-shell inner-page`}>
      <header className={styles.masthead}><div><span>PRIVATE COLLECTION</span><h1>收藏，<br />但不必公开。</h1><p>持仓、成本与估值默认保存在当前浏览器；你决定哪一张卡片进入公开收藏展示。</p></div><aside><span>PRIVACY MODE</span><b>ON</b><small>资产数值默认隐藏</small><Link href="/collections/demo">预览公开收藏 →</Link></aside></header>
      <div className={styles.note}><b>本地演示持仓</b><span>添加、编辑和公开状态仅写入此浏览器。真实资产数据不会上传，也不会自动生成交易建议。</span></div>
      <div className={styles.manager}><PortfolioManager seed={demoPortfolio} cards={joined} /></div>
      <section className={`${styles.supporting} concentration-grid`}>
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
