"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/browser";
import { useI18n } from "@/i18n/client";

const emailSchema = z.string().trim().email();
const otpSchema = z.string().regex(/^\d{6}$/);
const AUTH_COOLDOWN_SECONDS = 60;

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"*".repeat(Math.max(2, name.length - 1))}@${domain}`;
}

function authError(message: string) {
  const value = message.toLowerCase();
  if (value.includes("rate") || value.includes("too many")) return "请求过于频繁，请稍后再试。";
  if (value.includes("token") || value.includes("otp")) return "验证码无效或已过期，请重新发送。";
  if (value.includes("network") || value.includes("fetch")) return "网络连接失败，请检查网络后重试。";
  return "暂时无法完成登录，请稍后重试。";
}

export function EmailLoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const configured = hasSupabaseConfig();
  const requestInFlight = useRef(false);

  useEffect(() => {
    if (!seconds) return undefined;
    const timer = window.setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  async function sendCode(event?: React.FormEvent) {
    event?.preventDefault();
    if (requestInFlight.current || seconds > 0) return;
    setError("");
    if (!emailSchema.safeParse(email).success) { setError(locale === "en" ? "Enter a valid email address." : "请输入有效的邮箱地址。 "); return; }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError(t("auth.configMissing")); return; }
    requestInFlight.current = true;
    setPending(true);
    try {
      const { error: requestError } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (requestError) {
        setError(authError(requestError.message));
        if (requestError.message.toLowerCase().includes("rate") || requestError.message.toLowerCase().includes("too many")) {
          setSeconds(AUTH_COOLDOWN_SECONDS);
        }
        return;
      }
      setStep("code"); setSeconds(AUTH_COOLDOWN_SECONDS); setToken("");
    } finally {
      requestInFlight.current = false;
      setPending(false);
    }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!otpSchema.safeParse(token).success) { setError(locale === "en" ? "Enter the 6-digit code from your email." : "请输入邮件中的 6 位验证码。 "); return; }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setError(t("auth.configMissing")); return; }
    setPending(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    setPending(false);
    if (verifyError) { setError(authError(verifyError.message)); return; }
    router.replace(returnTo); router.refresh();
  }

  if (!configured) return <div className="auth-form"><p className="auth-error" role="status">{t("auth.configMissing")}</p><Link className="button button-secondary" href="/portfolio">{t("auth.demo")}</Link></div>;
  if (step === "email") return <form className="auth-form" onSubmit={sendCode} noValidate>
    <label><span>{t("auth.email")}</span><input autoComplete="email" autoFocus inputMode="email" type="email" value={email} placeholder={t("auth.emailPlaceholder")} onChange={(event) => setEmail(event.target.value)} /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit" disabled={pending}>{pending ? (locale === "en" ? "Sending…" : "发送中…") : t("auth.sendCode")}</button>
    <Link className="button button-secondary" href="/portfolio">{t("auth.demo")}</Link>
    <small className="auth-note">{t("auth.privacy")}</small>
  </form>;
  return <form className="auth-form" onSubmit={verifyCode} noValidate>
    <p className="auth-code-sent">{t("auth.codeSent")} <b>{maskEmail(email)}</b></p>
    <label><span>{t("auth.code")}</span><input autoComplete="one-time-code" autoFocus inputMode="numeric" maxLength={6} pattern="[0-9]*" value={token} onChange={(event) => setToken(event.target.value.replace(/\D/g, "").slice(0, 6))} /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit" disabled={pending}>{pending ? (locale === "en" ? "Verifying…" : "验证中…") : t("auth.verify")}</button>
    <button className="button button-secondary" type="button" disabled={pending || seconds > 0} onClick={() => void sendCode()}>{seconds ? `${t("auth.resend")} (${seconds}s)` : t("auth.resend")}</button>
    <button className="auth-text-button" type="button" onClick={() => { setStep("email"); setError(""); }}>{t("auth.changeEmail")}</button>
  </form>;
}
