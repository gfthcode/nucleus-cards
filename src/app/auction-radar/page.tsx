import type { Metadata } from "next";
import { AuctionRadar } from "@/components/auction-radar";

export const metadata: Metadata = {
  title: "NBA 球星卡拍卖雷达",
  description:
    "按球员、球队和卡片身份查看拍卖活动、来源状态与结束时间。演示拍卖与真实平台成交严格区分。",
  alternates: { canonical: "/auction-radar" },
};

export default function AuctionRadarPage() {
  return <AuctionRadar />;
}
