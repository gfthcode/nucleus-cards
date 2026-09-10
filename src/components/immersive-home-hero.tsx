"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Card, Player } from "@/types/domain";
import { CardImage } from "@/components/card-image";

type MarketReference = {
  precise: boolean;
  median: number | null;
  range: [number, number] | null;
  samples: number;
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function sceneOpacity(progress: number, start: number, end: number) {
  const fade = 0.08;
  return clamp(Math.min((progress - start) / fade, (end - progress) / fade, 1));
}

function formatCny(value: number | null) {
  return value === null ? "暂无样本" : `¥${Math.round(value).toLocaleString("zh-CN")}`;
}

export function ImmersiveHomeHero({
  slides,
}: {
  slides: Array<{ card: Card; player: Player; reference: MarketReference }>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section || reducedMotion) return;
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      setProgress(clamp(-section.getBoundingClientRect().top / scrollable));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      media.removeEventListener("change", updateMotion);
    };
  }, [reducedMotion]);

  const activeIndex = Math.min(slides.length - 1, Math.floor(progress * slides.length));
  const activeSlide = slides[activeIndex] ?? slides[slides.length - 1];
  const { card, player, reference } = activeSlide;

  const scene = (start: number, end: number, y = 16, x = "0") => ({
    opacity: reducedMotion ? (start === 0 ? 1 : 0) : sceneOpacity(progress, start, end),
    transform: `translate3d(${x}, ${reducedMotion ? 0 : (1 - sceneOpacity(progress, start, end)) * y}px, 0)`,
  });

  return (
    <section ref={sectionRef} className={`immersive-scroll ${reducedMotion ? "is-reduced-motion" : ""}`} aria-label="市场沉浸式导览">
      <div className="immersive-sticky-scene">
        <div className="immersive-grid" aria-hidden="true" />
        <div className="immersive-orbit immersive-orbit-one" aria-hidden="true" />
        <div className="immersive-orbit immersive-orbit-two" aria-hidden="true" />
        <div className="immersive-scene-eyebrow">NUCLEUS CARDS / MARKET SIGNALS</div>

        <div className="immersive-copy immersive-copy-intro" style={scene(0, 0.3, 28, "-50%")}>
          <span className="section-kicker">COLLECTOR INTELLIGENCE</span>
          <h2>只追踪真正重要的卡。</h2>
          <p>从一张卡开始，把身份、成交、挂牌和风险信号放回同一条可核验链路。</p>
          <span className="immersive-scroll-hint"><ArrowDown size={14} /> 向下滚动探索</span>
        </div>

        <div className="immersive-card-stage" style={{
          transform: `translate3d(0, ${reducedMotion ? 0 : (progress * -14).toFixed(2)}%, 0) scale(${reducedMotion ? 1 : (1 + progress * 0.08).toFixed(3)})`,
        }}>
          <div className="immersive-card-halo" aria-hidden="true" />
          <div className="immersive-card-frame">
            <CardImage card={card} player={player} size="large" />
            <span className="immersive-card-stamp">{card.demo ? "演示身份" : "已核验身份"}</span>
          </div>
          <div className="immersive-card-caption">
            <b>{player.name}</b>
            <span>{card.releaseYear} · {card.brand} {card.productLine}</span>
            <small>{card.parallel} · {card.condition === "graded" ? `${card.gradingCompany} ${card.grade}` : "Raw"}</small>
          </div>
          <div className="immersive-slide-rail" aria-label="首页卡片序列">
            {slides.map((slide, index) => <span className={index === activeIndex ? "active" : ""} key={slide.card.id}>{slide.player.name}</span>)}
          </div>
        </div>

        <div className="immersive-copy immersive-copy-signal" style={scene(0.24, 0.56, 20, "-50%")}>
          <span className="section-kicker">IDENTITY FIRST</span>
          <h2>先确认你看的，真的是同一张卡。</h2>
          <p>球员、年份、品牌、系列、卡号、平行和等级逐项对齐；图片未获授权时，界面会明确保留占位。</p>
          <Link href={`/cards/${card.id}`} className="immersive-inline-link">查看完整卡片身份 <ArrowRight size={14} /></Link>
        </div>

        <div className="immersive-market-panel" style={scene(0.5, 0.79, 16)}>
          <div><span className="section-kicker">MARKET REFERENCE</span><h2>先看成交，再看挂牌。</h2><p>当前样本来自站内演示数据，只有达到样本门槛才标记为精确。</p></div>
          <div className="immersive-market-metrics">
            <span><small>中位参考</small><b>{formatCny(reference.median)}</b></span>
            <span><small>样本数</small><b>{reference.samples || "—"}</b></span>
            <span><small>7D 变化</small><b className={card.change7d && card.change7d >= 0 ? "positive" : "negative"}>{card.change7d === undefined ? "—" : `${card.change7d > 0 ? "+" : ""}${card.change7d}%`}</b></span>
          </div>
          <span className="immersive-data-note">{reference.precise ? "样本达到精确口径" : "样本不足：仅作观察线索"}</span>
        </div>

        <div className="immersive-copy immersive-copy-close" style={scene(0.74, 1, 12, "-50%")}>
          <span className="section-kicker">YOUR NEXT MOVE</span>
          <h2>一张卡，读懂市场。</h2>
          <p>把搜索、拍卖雷达和方法说明连起来，再决定是否加入自己的观察清单。</p>
          <div className="immersive-hero-actions">
            <Link href="/market" className="primary">搜索卡片 <ArrowRight size={15} /></Link>
            <Link href="/auction-radar">打开拍卖雷达 <ExternalLink size={13} /></Link>
          </div>
          <small className="immersive-source-note">演示快照 · 非实时行情 · <Link href="/methodology">查看数据口径</Link></small>
        </div>
        <div className="immersive-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      </div>
    </section>
  );
}
