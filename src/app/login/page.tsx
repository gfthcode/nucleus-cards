import Image from "next/image";
import type { Metadata } from "next";
import { EmailLoginForm } from "@/components/auth/email-login-form";
import { getLocale, getServerTranslator } from "@/i18n/server";
import { safeReturnTo } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "登录 / Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const locale = await getLocale();
  const t = getServerTranslator(locale);
  const params = await searchParams;
  const returnTo = safeReturnTo(typeof params.returnTo === "string" ? params.returnTo : null);
  return <main className="auth-page"><section>
    <span className="brand-mark"><Image src="/icon.svg" alt="" width={56} height={56} priority /></span>
    <span className="section-kicker">NUCLEUS CARDS</span>
    <h1>{t("auth.title")}</h1>
    <p>{t("auth.description")}</p>
    <EmailLoginForm returnTo={returnTo} />
  </section></main>;
}
