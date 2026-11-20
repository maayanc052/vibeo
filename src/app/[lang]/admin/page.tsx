import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Inbox } from "lucide-react";
import { hasLocale, localeTag, localizedPath, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import {
  REGISTRATION_STATUSES,
  countRegistrationsByStatus,
  listRegistrations,
  type AdminRegistration,
  type RegistrationStatus,
} from "@/lib/admin/registrations";
import { labelFor, optionsFor, parseFormFields } from "@/lib/forms/schema";
import { RegistrationActions } from "@/components/admin/RegistrationActions";

/** תור אישור הרשמות — לשוניות לפי סטטוס (?status=...) */
export default async function ApprovalsPage({ params, searchParams }: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const sp = await searchParams;
  const requested = typeof sp.status === "string" ? sp.status : "pending_approval";
  const status = (REGISTRATION_STATUSES as string[]).includes(requested)
    ? (requested as RegistrationStatus)
    : "pending_approval";

  const [t, registrations, counts] = await Promise.all([
    getDictionary(lang),
    listRegistrations(status),
    countRegistrationsByStatus(),
  ]);
  const a = t.admin.approvals;

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">{a.title}</h1>
      <p className="mt-1 max-w-2xl text-muted">{a.subtitle}</p>

      <div role="tablist" className="mt-6 flex flex-wrap gap-2">
        {REGISTRATION_STATUSES.map((s) => (
          <Link
            key={s}
            role="tab"
            aria-selected={s === status}
            href={`${localizedPath(lang, "/admin")}?status=${s}`}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
              s === status ? "border-violet-400/60 bg-violet-500/15 text-white" : "border-white/10 text-white/65 hover:bg-white/5"
            }`}
          >
            {a.tabs[s]}
            <span className="rounded-full bg-white/10 px-2 text-xs">{counts[s]}</span>
          </Link>
        ))}
      </div>

      {registrations.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-muted">
          <Inbox className="mx-auto size-10" />
          <p className="mt-3">{a.empty}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {registrations.map((r) => (
            <RegistrationRow key={r.id} r={r} lang={lang} t={t} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RegistrationRow({ r, lang, t }: { r: AdminRegistration; lang: Locale; t: Dictionary }) {
  const a = t.admin.approvals;
  const fmt = (iso: string, withTime = true) =>
    new Intl.DateTimeFormat(localeTag[lang], {
      day: "numeric",
      month: "short",
      ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
      timeZone: "Asia/Jerusalem",
    }).format(new Date(iso));

  // תשובות הטופס הדינמי — מוצגות עם התוויות של השדות ושל האפשרויות
  const fields = parseFormFields(r.event?.custom_form_fields);
  const answers = (r.custom_answers && typeof r.custom_answers === "object" && !Array.isArray(r.custom_answers)
    ? r.custom_answers
    : {}) as Record<string, unknown>;
  const answerItems = fields
    .filter((f) => answers[f.id] !== undefined && answers[f.id] !== "")
    .map((f) => {
      const v = answers[f.id];
      const display =
        typeof v === "boolean"
          ? v ? a.yes : a.no
          : labelFor(optionsFor(f).find((o) => o.value === v)?.label ?? String(v), lang);
      return { id: f.id, label: labelFor(f.label, lang), value: display };
    });

  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-bold">{r.profile?.full_name || r.profile?.email}</p>
          {r.profile?.email && (
            <p dir="ltr" className="text-sm text-muted ltr:text-left rtl:text-right">
              {r.profile.email}
            </p>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80">
            <CalendarDays className="size-4 text-cyan-300" />
            <span className="font-semibold">{r.event?.title}</span>
            {r.event && <span className="text-muted">· {fmt(r.event.event_date, false)}</span>}
            {r.event?.organization && <span className="text-muted">· {r.event.organization.name}</span>}
            {r.event && (
              <span className="text-muted">
                · {Number(r.event.price) === 0 ? a.free : `${t.common.currency}${Number(r.event.price)}`}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted">
            {a.registeredAt}: {fmt(r.created_at)}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {answerItems.length === 0 ? (
              <span className="text-xs text-muted">{a.noAnswers}</span>
            ) : (
              answerItems.map((it) => (
                <span key={it.id} className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs">
                  <span className="text-muted">{it.label}:</span> {it.value}
                </span>
              ))
            )}
          </div>
        </div>

        <RegistrationActions registrationId={r.id} status={r.status} t={a} />
      </div>
    </li>
  );
}
