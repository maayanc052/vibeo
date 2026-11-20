"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, LogIn, MailCheck } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/he";
import { sendLoginCode, verifyLoginCode } from "@/app/[lang]/login/actions";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 disabled:opacity-60";
const buttonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-violet-500 to-cyan-500 px-5 py-3.5 font-bold text-white transition enabled:hover:brightness-110 disabled:opacity-60";

/** טופס כניסה בשני שלבים: מייל → קוד */
export function LoginForm({ lang, t }: { lang: Locale; t: Dictionary["login"] }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const errorText = (key: string) => t.errors[key] ?? t.errors.unknown;

  function onSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await sendLoginCode(email);
      if (res.ok) setStep("code");
      else setError(errorText(res.error));
    });
  }

  function onVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      // בהצלחה השרת מפנה ללוח הניהול; כאן מגיעים רק בשגיאה
      const res = await verifyLoginCode(email, code, lang);
      if (res && !res.ok) setError(errorText(res.error));
    });
  }

  const [before, after] = t.codeSent.split("{email}");

  return step === "email" ? (
    <form onSubmit={onSendCode} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-white/85">
          {t.email}
        </label>
        <input
          id="login-email"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
          disabled={pending}
          className={`${inputClass} text-start`}
        />
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-pink-500/10 px-4 py-3 text-sm text-pink-200">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending || !email.trim()} className={buttonClass}>
        {pending ? <Loader2 className="size-5 animate-spin" /> : <MailCheck className="size-5" />}
        {pending ? t.sending : t.sendCode}
      </button>
    </form>
  ) : (
    <form onSubmit={onVerify} className="space-y-4">
      <p className="text-muted">
        {before}
        <bdi dir="ltr" className="font-semibold text-white">
          {email}
        </bdi>
        {after}
      </p>
      <label htmlFor="login-code" className="sr-only">
        {t.codeLabel}
      </label>
      <input
        id="login-code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
        inputMode="numeric"
        autoComplete="one-time-code"
        dir="ltr"
        placeholder="••••••"
        autoFocus
        disabled={pending}
        className={`${inputClass} text-center font-mono text-3xl tracking-[0.5em]`}
      />
      {error && (
        <p role="alert" className="rounded-xl bg-pink-500/10 px-4 py-3 text-sm text-pink-200">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending || code.length < 6} className={buttonClass}>
        {pending ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
        {pending ? t.verifying : t.verify}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("email");
          setCode("");
          setError(null);
        }}
        disabled={pending}
        className="w-full text-sm text-muted hover:text-white"
      >
        {t.changeEmail}
      </button>
    </form>
  );
}
