"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, RotateCcw, X } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/he";
import type { RegistrationStatus } from "@/lib/admin/registrations";
import { setRegistrationStatus } from "@/app/[lang]/admin/actions";

type Props = {
  registrationId: string;
  status: RegistrationStatus;
  t: Dictionary["admin"]["approvals"];
};

/** כפתורי אישור / דחייה / החזרה להמתנה לשורת הרשמה */
export function RegistrationActions({ registrationId, status, t }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "warn" | "error"; text: string } | null>(null);

  function run(target: RegistrationStatus) {
    if (target === "cancelled" && !window.confirm(t.confirmReject)) return;
    setMessage(null);
    startTransition(async () => {
      const res = await setRegistrationStatus(registrationId, target);
      if (!res.ok) {
        setMessage({ tone: "error", text: t.errors[res.error] ?? t.errors.unknown });
        return;
      }
      const email = res.data.email;
      if (email === "sent") setMessage({ tone: "ok", text: t.emailSent });
      else if (email === "skipped") setMessage({ tone: "warn", text: t.emailSkipped });
      else if (email === "failed") setMessage({ tone: "warn", text: t.emailFailed });
      else setMessage({ tone: "ok", text: t.done });
    });
  }

  const base =
    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {pending && <Loader2 className="size-5 animate-spin self-center text-muted" />}
        {status !== "approved" && status !== "paid" && (
          <button type="button" disabled={pending} onClick={() => run("approved")} className={`${base} bg-emerald-500/90 text-white hover:bg-emerald-500`}>
            <Check className="size-4" />
            {t.approve}
          </button>
        )}
        {status !== "cancelled" && (
          <button type="button" disabled={pending} onClick={() => run("cancelled")} className={`${base} border border-white/15 text-white/80 hover:bg-white/10`}>
            <X className="size-4" />
            {t.reject}
          </button>
        )}
        {status !== "pending_approval" && status !== "paid" && (
          <button type="button" disabled={pending} onClick={() => run("pending_approval")} className={`${base} text-white/60 hover:text-white`}>
            <RotateCcw className="size-4" />
            {t.restore}
          </button>
        )}
      </div>
      {message && (
        <p
          role="status"
          className={`text-xs ${message.tone === "ok" ? "text-emerald-300" : message.tone === "warn" ? "text-amber-300" : "text-pink-300"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
