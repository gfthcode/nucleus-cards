"use client";

import { useState } from "react";

export function CsvImporter() {
  const [result, setResult] = useState("");
  async function handle(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setResult("仅支持 CSV 文件");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setResult("文件超过 2MB 限制");
      return;
    }
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0]?.split(",").map((item) => item.trim()) ?? [];
    const required = [
      "card_identity_key",
      "sold_at",
      "amount",
      "currency",
      "source",
    ];
    const missing = required.filter((item) => !headers.includes(item));
    setResult(
      missing.length
        ? `缺少字段：${missing.join("、")}`
        : `校验通过：${Math.max(0, lines.length - 1)} 条记录已进入演示审核队列`,
    );
  }
  return (
    <div className="csv-importer">
      <label>
        <span>选择 CSV 成交记录</span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => handle(event.target.files?.[0])}
        />
        <small>最大 2MB；不会自动写入正式数据库</small>
      </label>
      {result && <p>{result}</p>}
    </div>
  );
}
