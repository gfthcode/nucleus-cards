import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "登录" };
export default function LoginPage() {
  return (
    <main className="auth-page">
      <section>
        <span className="brand-mark">N</span>
        <span className="section-kicker">NUCLEUS CARDS</span>
        <h1>登录你的收藏工作台</h1>
        <p>
          没有 Supabase 凭据时，使用演示账户即可体验持仓、公开收藏和提醒中心。
        </p>
        <div className="demo-account">
          <b>演示账户</b>
          <span>collector@nucleus.demo</span>
          <small>数据保存在浏览器本地，不上传个人信息。</small>
        </div>
        <Link className="button button-primary" href="/portfolio">
          进入演示模式
        </Link>
        <button className="button button-secondary" disabled>
          Supabase 登录（配置后启用）
        </button>
        <small className="auth-note">
          生产模式不使用硬编码密码；请在 Supabase 中配置邮箱或 OAuth 登录。
        </small>
      </section>
    </main>
  );
}
