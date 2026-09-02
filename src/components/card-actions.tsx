"use client";

import { useState } from "react";

export function CardActions() {
  const [watching, setWatching] = useState(false);
  const [added, setAdded] = useState(false);
  return (
    <div className="card-actions">
      <button
        className={`button ${watching ? "button-primary" : "button-secondary"}`}
        onClick={() => setWatching(!watching)}
      >
        {watching ? "✓ 已关注" : "＋ 加入关注"}
      </button>
      <button
        className={`button ${added ? "button-primary" : "button-secondary"}`}
        onClick={() => setAdded(!added)}
      >
        {added ? "✓ 已加入持仓草稿" : "加入持仓"}
      </button>
    </div>
  );
}
