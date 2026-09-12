"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./marketing.module.css";

const features = [
  "REAL SALES DATA",
  "AI CARD ANALYSIS",
  "PLAYER INTELLIGENCE",
  "COLLECTION",
  "PORTFOLIO",
  "MARKET MOVERS",
  "AUCTIONS",
  "WATCHLIST",
  "PRICE ALERTS",
  "CARD SCANNER",
  "COMPARABLE SALES",
  "NBA PLAYERS",
  "NBA TEAMS",
];

export function FeatureRail() {
  const items = [...features, ...features];
  return (
    <section className={styles.featureRail} aria-label="Nucleus Cards 功能">
      <div className={styles.featureRailViewport}>
        <div className={styles.featureRailTrack}>
          {items.map((feature, index) => (
            <span className={styles.featurePill} key={`${feature}-${index}`} aria-hidden={index >= features.length}>
              <i aria-hidden />
              {feature}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`${styles.reveal} ${visible ? styles.revealVisible : ""} ${className}`}>{children}</div>;
}
