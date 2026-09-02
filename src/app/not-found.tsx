import Link from "next/link";
export default function NotFound() {
  return (
    <main className="state-page">
      <span className="brand-mark">N</span>
      <h1>找不到这条记录</h1>
      <p>卡片、球员或球队可能尚未收录，或链接已经失效。</p>
      <Link className="button button-primary" href="/market">
        返回行情市场
      </Link>
    </main>
  );
}
