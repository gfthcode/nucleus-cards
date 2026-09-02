"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fullData = [
  ["2025-09", 4880],
  ["2025-11", 5200],
  ["2026-01", 5550],
  ["2026-03", 6040],
  ["2026-05", 6280],
  ["2026-06", 6900],
  ["2026-07", 7350],
  ["08/01", 7180],
  ["08/08", 7420],
  ["08/15", 7680],
  ["08/22", 8015],
  ["08/30", 8420],
].map(([date, price]) => ({ date, price }));

export function PriceChart() {
  const [period, setPeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");
  const data = useMemo(
    () =>
      fullData.slice(
        period === "7D"
          ? -3
          : period === "30D"
            ? -6
            : period === "90D"
              ? -9
              : 0,
      ),
    [period],
  );
  return (
    <div className="price-chart-wrap">
      <div className="chart-toolbar">
        <div>
          <b>可信成交中位价</b>
          <small>排除组合交易及已标记异常值</small>
        </div>
        <div role="group" aria-label="价格图表周期">
          {(["7D", "30D", "90D", "1Y"] as const).map((item) => (
            <button
              className={period === item ? "active" : ""}
              onClick={() => setPeriod(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="rechart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 15, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5796ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#5796ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#20314a"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6f86a2", fontSize: 10 }}
              axisLine={{ stroke: "#263a55" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6f86a2", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `¥${Number(value) / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                background: "#0e1b2c",
                border: "1px solid #2a4162",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [
                `¥${Number(value).toLocaleString()}`,
                "成交中位价",
              ]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#5796ff"
              strokeWidth={2}
              fill="url(#priceFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
