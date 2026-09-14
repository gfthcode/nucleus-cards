import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PersonalWorkspace } from "@/components/personal-workspace";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "我的收藏" };

export default async function CollectionsPage() {
  const { supabase, user } = await getAuthenticatedUser();
  if (supabase && user) return <main className="page-shell inner-page"><header className="page-header"><div><span className="section-kicker">PRIVATE COLLECTION</span><h1>我的收藏</h1><p>只显示当前登录账号的收藏记录。公开橱窗仍可单独控制。</p></div><div className="page-actions"><Link className="button button-secondary" href="/collections/demo">查看公开演示</Link></div></header><PersonalWorkspace mode="collection" /></main>;
  redirect("/collections/demo");
}
