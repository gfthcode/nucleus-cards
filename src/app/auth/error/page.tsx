import Link from "next/link";
import { getLocale, getServerTranslator } from "@/i18n/server";
import { safeReturnTo } from "@/lib/supabase/server";

export default async function AuthErrorPage({ searchParams }: PageProps<"/auth/error">) {
  const params = await searchParams;
  const next = safeReturnTo(typeof params.next === "string" ? params.next : null);
  const locale = await getLocale();
  const t = getServerTranslator(locale);
  return <main className="auth-page"><section>
    <span className="section-kicker">NUCLEUS CARDS</span>
    <h1>{t("auth.errorLinkTitle")}</h1>
    <p>{t("auth.errorLinkDescription")}</p>
    <Link className="button button-primary" href={`/login?returnTo=${encodeURIComponent(next)}`}>{t("auth.sendAnotherLink")}</Link>
    <Link className="button button-secondary" href="/">{t("auth.backHome")}</Link>
  </section></main>;
}
