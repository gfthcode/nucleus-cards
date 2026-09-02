"use client";

import { useMemo, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const fullData = [
  ["2025-09",4880,5260],["2025-11",5200,5580],["2026-01",5550,5890],["2026-03",6040,6480],
  ["2026-05",6280,6720],["2026-06",6900,7310],["2026-07",7350,7780],["08/01",7180,7620],
  ["08/08",7420,7900],["08/15",7680,8140],["08/22",8015,8520],["08/30",8420,8990],
].map(([date, price, listing])=>({date,price,listing}));

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{value?: number}>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="terminal-chart-tooltip"><span>{label}</span><b>¥{Number(payload[0].value).toLocaleString()}</b></div>;
}

export function PriceChart() {
  const [period,setPeriod] = useState<"7D"|"30D"|"90D"|"1Y">("30D");
  const data = useMemo(()=>fullData.slice(period === "7D" ? -3 : period === "30D" ? -6 : period === "90D" ? -9 : 0),[period]);
  return <div className="price-chart-wrap terminal-price-chart">
    <div className="chart-toolbar"><div><b>价格趋势</b><small>可信成交中位价 · CNY</small></div><div role="group" aria-label="价格图表周期">{(["7D","30D","90D","1Y"] as const).map(item=><button className={period===item?"active":""} onClick={()=>setPeriod(item)} key={item}>{item}</button>)}</div></div>
    <div className="chart-legend"><span><i className="solid-dot" />真实成交价</span><span><i className="hollow-dot" />在售标价</span></div>
    <div className="rechart-area"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={data} margin={{top:15,right:12,left:-10,bottom:0}}>
      <defs><linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid stroke="var(--terminal-line)" strokeDasharray="3 3" vertical={false}/>
      <XAxis dataKey="date" tick={{fill:"#64748b",fontSize:9}} axisLine={{stroke:"#334155"}} tickLine={false}/>
      <YAxis tick={{fill:"#64748b",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={(value)=>`¥${Number(value)/1000}k`}/>
      <Tooltip content={<ChartTooltip />} cursor={{stroke:"#64748b",strokeDasharray:"3 3"}}/>
      <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} fill="url(#priceFill)" dot={{r:3,fill:"#3b82f6",strokeWidth:0}} activeDot={{r:4}}/>
      <Line type="monotone" dataKey="listing" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" dot={{r:3,fill:"var(--terminal-panel)",stroke:"#94a3b8",strokeWidth:1.5}} activeDot={{r:4,fill:"var(--terminal-panel)",stroke:"#94a3b8"}}/>
    </ComposedChart></ResponsiveContainer></div>
  </div>;
}
