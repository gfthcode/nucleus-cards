"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/browser";
import { useI18n } from "@/i18n/client";

const emailSchema = z.string().trim().email();
const AUTH_COOLDOWN_SECONDS = 60;
const cooldownKey = (value: string) => `nucleus-auth-cooldown:${value.trim().toLowerCase()}`;

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"*".repeat(Math.max(2, name.length - 1))}@${domain}`;
}

function authError(message: string, translate: (key: "auth.errorRate" | "auth.errorNetwork" | "auth.errorGeneric") => string) {
  const value = message.toLowerCase();
  if (value.includes("rate") || value.includes("too many")) return translate("auth.errorRate");
  if (value.includes("network") || value.includes("fetch")) return translate("auth.errorNetwork");
  return translate("auth.errorGeneric");
}

export function EmailLoginForm({ returnTo }: { returnTo: string }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
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

  function handleEmailChange(value: string) {
    setEmail(value);
    const until = Number(window.localStorage.getItem(cooldownKey(value)) ?? 0);
    setSeconds(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
  }

  async function sendLink(event?: React.FormEvent) {
    event?.preventDefault();
    if (requestInFlight.current || seconds > 0) return;
    setError("");
    if (!emailSchema.safeParse(email).success) {
      setError(t("auth.errorEmail"));
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError(t("auth.configMissing"));
      return;
    }
    requestInFlight.current = true;
    setPending(true);
    try {
      const callback = new URL("/auth/confirm", window.location.origin);
      callback.searchParams.set("next", returnTo);
      const { error: requestError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true, emailRedirectTo: callback.toString() },
      });
      if (requestError) {
        setError(authError(requestError.message, t));
        if (requestError.message.toLowerCase().includes("rate") || requestError.message.toLowerCase().includes("too many")) {
          const until = Date.now() + AUTH_COOLDOWN_SECONDS * 1000;
          window.localStorage.setItem(cooldownKey(email), String(until));
          setSeconds(AUTH_COOLDOWN_SECONDS);
        }
        return;
      }
      window.localStorage.setItem(cooldownKey(email), String(Date.now() + AUTH_COOLDOWN_SECONDS * 1000));
      setStep("sent");
      setSeconds(AUTH_COOLDOWN_SECONDS);
    } finally {
      requestInFlight.current = false;
      setPending(false);
    }
  }

  if (!configured) return <div className="auth-form"><p className="auth-error" role="status">{t("auth.configMissing")}</p><Link className="button button-secondary" href="/portfolio">{t("auth.demo")}</Link></div>;
  if (step === "sent") return <section className="auth-form" aria-live="polite">
    <h2>{t("auth.linkSentTitle")}</h2>
    <p className="auth-code-sent">{t("auth.linkSentDescription")} <b>{maskEmail(email)}</b></p>
    <p className="auth-note">{t("auth.linkSentInstruction")}</p>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button className="button button-primary" type="button" disabled={pending || seconds > 0} onClick={() => void sendLink()}>{pending ? t("auth.sending") : seconds ? `${t("auth.resendLinkIn")} ${seconds}s` : t("auth.resendLink")}</button>
    <button className="button button-secondary" type="button" disabled={pending} onClick={() => { setStep("email"); setError(""); }}>{t("auth.useAnotherEmail")}</button>
    <Link className="auth-text-button" href="/">{t("auth.backHome")}</Link>
  </section>;
  return <form className="auth-form" onSubmit={sendLink} noValidate>
    <label><span>{t("auth.email")}</span><input autoComplete="email" autoFocus inputMode="email" type="email" value={email} placeholder={t("auth.emailPlaceholder")} onChange={(event) => handleEmailChange(event.target.value)} /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit" disabled={pending || seconds > 0}>{pending ? t("auth.sending") : seconds ? `${t("auth.tryAgainIn")} ${seconds}s` : t("auth.sendLink")}</button>
    <Link className="button button-secondary" href="/portfolio">{t("auth.demo")}</Link>
    <small className="auth-note">{t("auth.privacy")}</small>
  </form>;
}
