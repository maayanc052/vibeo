"use client";

import { useState, useTransition, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/he";
import type { FormAnswers, FormField } from "@/lib/forms/schema";
import { DynamicField } from "./DynamicField";
import { ForwardArrow } from "@/components/i18n/ForwardArrow";
import {
  completeRegistration,
  startRegistration,
} from "@/app/[lang]/[orgSlug]/events/[eventId]/actions";

type Step = "details" | "code" | "done";

type Props = {
  eventId: string;
  lang: Locale;
  fields: FormField[];
  t: Dictionary["register"];
};

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/30 disabled:opacity-60";

const buttonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

const brandGradient = { background: "linear-gradient(90deg, var(--brand), var(--brand-2))" };

/** תהליך ההרשמה: פרטים + טופס דינמי → קוד אימות במייל → אישור */
export function RegistrationFlow({ eventId, lang, fields, t }: Props) {
  const [step, setStep] = useState<Step>("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const errorText = (codeKey: string) => t.errors[codeKey] ?? t.errors.unknown;

  /** מציג שגיאות שדה שהשרת החזיר (JSON של {fieldId: errorType}) */
  function applyServerFieldErrors(message?: string) {
    if (!message) return;
    try {
      const parsed = JSON.parse(message) as Record<string, string>;
      setFieldErrors(Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, t.fieldErrors[v] ?? v])));
    } catch {
      // הודעה לא בפורמט שדות — מתעלמים
    }
  }

  function finish(token?: string) {
    startTransition(async () => {
      const res = await completeRegistration({ eventId, email, fullName, token, answers });
      if (res.ok) {
        setStep("done");
        return;
      }
      if (res.error === "validation") {
        applyServerFieldErrors(res.message);
        setStep("details");
      }
      setError(errorText(res.error));
    });
  }

  function onSubmitDetails(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    // בדיקת שדות חובה בדפדפן (השרת בודק שוב)
    const missing: Record<string, string> = {};
    for (const f of fields) {
      const v = answers[f.id];
      if (f.required && (f.type === "checkbox" ? v !== true : typeof v !== "string" || !v.trim())) {
        missing[f.id] = t.fieldErrors.required;
      }
    }
    setFieldErrors(missing);
    if (Object.keys(missing).length > 0) return;

    startTransition(async () => {
      const res = await startRegistration({ eventId, email, fullName });
      if (!res.ok) {
        setError(errorText(res.error));
        return;
      }
      if (res.data.otpSent) setStep("code");
      else finish(); // כבר מחוברים עם אותו מייל — ממשיכים ישירות לשמירה
    });
  }

  function onSubmitCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    finish(code);
  }

  function resendCode() {
    setError(null);
    startTransition(async () => {
      const res = await startRegistration({ eventId, email, fullName });
      if (res.ok) setNotice(t.resent);
      else setError(errorText(res.error));
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {step === "details" && (
          <motion.form
            key="details"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={onSubmitDetails}
            noValidate
            className="space-y-4"
          >
            <div>
              <h2 className="text-2xl font-bold">{t.title}</h2>
              <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
            </div>

            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-white/85">
                {t.fullName} <span className="text-pink-300">*</span>
              </label>
              <input
                id="reg-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                disabled={pending}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-white/85">
                {t.email} <span className="text-pink-300">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={pending}
                className={`${inputClass} text-start`}
              />
              <p className="mt-1 text-xs text-muted">{t.emailHint}</p>
            </div>

            {fields.map((f) => (
              <DynamicField
                key={f.id}
                field={f}
                lang={lang}
                value={answers[f.id]}
                error={fieldErrors[f.id]}
                onChange={(v) => {
                  setAnswers((a) => ({ ...a, [f.id]: v }));
                  setFieldErrors((errs) => {
                    const next = { ...errs };
                    delete next[f.id];
                    return next;
                  });
                }}
                t={t}
                disabled={pending}
              />
            ))}

            {error && (
              <p role="alert" className="rounded-xl bg-pink-500/10 px-4 py-3 text-sm text-pink-200">
                {error}
              </p>
            )}

            <button type="submit" disabled={pending || !fullName.trim() || !email.trim()} className={buttonClass} style={brandGradient}>
              {pending ? <Loader2 className="size-5 animate-spin" /> : null}
              {pending ? t.sending : t.continue}
              {!pending && <ForwardArrow className="size-5" />}
            </button>
          </motion.form>
        )}

        {step === "code" && (
          <motion.form
            key="code"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={onSubmitCode}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl" style={brandGradient}>
                <MailCheck className="size-6 text-white" />
              </span>
              <h2 className="text-2xl font-bold">{t.codeTitle}</h2>
            </div>
            <p className="text-muted">
              {t.codeSent.split("{email}")[0]}
              <bdi dir="ltr" className="font-semibold text-white">
                {email}
              </bdi>
              {t.codeSent.split("{email}")[1]}
            </p>

            <div>
              <label htmlFor="reg-code" className="sr-only">
                {t.codeLabel}
              </label>
              <input
                id="reg-code"
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
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-pink-500/10 px-4 py-3 text-sm text-pink-200">
                {error}
              </p>
            )}
            {notice && <p className="text-sm text-emerald-300">{notice}</p>}

            <button type="submit" disabled={pending || code.length < 6} className={buttonClass} style={brandGradient}>
              {pending ? <Loader2 className="size-5 animate-spin" /> : null}
              {pending ? t.verifying : t.verify}
            </button>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setCode("");
                  setError(null);
                }}
                disabled={pending}
                className="text-muted underline-offset-4 hover:text-white hover:underline"
              >
                {t.changeEmail}
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={pending}
                className="text-[color:var(--brand-2)] underline-offset-4 hover:underline"
              >
                {t.resend}
              </button>
            </div>
          </motion.form>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 text-center"
            role="status"
          >
            <CheckCircle2 className="mx-auto size-16 text-emerald-300" />
            <h2 className="mt-4 text-2xl font-bold">{t.successTitle}</h2>
            <p className="mx-auto mt-2 max-w-sm text-muted">{t.successBody}</p>
            <p className="mt-5 inline-block rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-sm text-amber-200">
              {t.successStatus}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
