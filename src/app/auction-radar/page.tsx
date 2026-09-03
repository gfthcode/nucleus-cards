import type { Metadata } from "next";
import { AuctionRadar } from "@/components/auction-radar";

export const metadata: Metadata = { title: "拍卖雷达" };

export default function AuctionRadarPage() { return <AuctionRadar />; }
