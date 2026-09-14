import type { Metadata } from "next";
import { PersonalWorkspace } from "@/components/personal-workspace";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = { title: "我的关注" };

export default async function WatchlistPage() {
  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase || !user) return <main className="page-shell inner-page"><header className="page-header"><div><span className="section-kicker">WATCHLIST</span><h1>我的关注</h1><p>配置 Supabase 并登录后，关注记录会保存在你的个人工作区。</p></div><div className="page-actions"><Link className="button button-primary" href="/login?returnTo=%2Fwatchlist">登录</Link></div></header></main>;
  return <main className="page-shell inner-page"><header className="page-header"><div><span className="section-kicker">WATCHLIST</span><h1>我的关注</h1><p>关注的卡片与目标价格只保存在你的账号中。</p></div></header><PersonalWorkspace mode="watchlist" /></main>;
}
