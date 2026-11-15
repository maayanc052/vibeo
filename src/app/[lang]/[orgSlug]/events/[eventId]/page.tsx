import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import { hasLocale, localeTag, localizedPath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  getActiveEvents,
  getEventById,
  getOrganizationBySlug,
  toEventView,
  toOrganizationView,
} from "@/lib/data/organizations";
import { parseFormFields } from "@/lib/forms/schema";
import { TenantShell } from "@/components/tenant/TenantShell";
import { RegistrationFlow } from "@/components/forms/RegistrationFlow";

// מזהה דמה שמוביל ל-404 — כי עם cacheComponents חובה להחזיר לפחות תוצאה אחת
// (למשל לארגון בלי אירועים, או לסלאג דינמי שלא ידוע בזמן הבנייה)
const PLACEHOLDER_EVENT_ID = "none";

// כל האירועים הפעילים של הארגון נבנים מראש; אירוע חדש ייבנה בבקשה הראשונה
export async function generateStaticParams({ params }: { params: { orgSlug?: string } }) {
  const org = params.orgSlug ? await getOrganizationBySlug(params.orgSlug) : null;
  const events = org ? await getActiveEvents(org.id) : [];
  const ids = events.map((e) => ({ eventId: e.id }));
  return ids.length > 0 ? ids : [{ eventId: PLACEHOLDER_EVENT_ID }];
}

async function load(lang: string, orgSlug: string, eventId: string) {
  if (!hasLocale(lang)) return null;
  const [orgRow, eventRow] = await Promise.all([getOrganizationBySlug(orgSlug), getEventById(eventId)]);
  // האירוע חייב להיות שייך לארגון שבכתובת (הפרדה בין ארגונים)
  if (!orgRow || !eventRow || eventRow.organization_id !== orgRow.id) return null;
  return { lang, orgRow, eventRow };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[orgSlug]/events/[eventId]">): Promise<Metadata> {
  const { lang, orgSlug, eventId } = await params;
  const data = await load(lang, orgSlug, eventId);
  if (!data) return {};
  const org = toOrganizationView(data.orgRow, data.lang);
  const event = toEventView(data.eventRow, data.lang);
  return { title: `${event.title} · ${org.name}`, description: event.description ?? undefined };
}

// הפרמטרים עשויים להיות ידועים רק בזמן הבקשה (אירוע/ארגון חדש) — לכן התוכן עטוף ב-Suspense.
// לאירועים שנבנו מראש התוכן מוכן מיד, בלי מצב טעינה.
export default function EventPage({ params }: PageProps<"/[lang]/[orgSlug]/events/[eventId]">) {
  return (
    <Suspense fallback={<EventPageSkeleton />}>
      <EventContent params={params} />
    </Suspense>
  );
}

function EventPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-24" aria-busy="true">
      <div className="h-72 rounded-3xl bg-white/[0.05]" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="h-20 rounded-2xl bg-white/[0.05]" />
        <div className="h-20 rounded-2xl bg-white/[0.05]" />
      </div>
    </div>
  );
}

async function EventContent({ params }: { params: PageProps<"/[lang]/[orgSlug]/events/[eventId]">["params"] }) {
  const { lang, orgSlug, eventId } = await params;
  const data = await load(lang, orgSlug, eventId);
  if (!data) notFound();

  const t = await getDictionary(data.lang);
  const org = toOrganizationView(data.orgRow, data.lang);
  const event = toEventView(data.eventRow, data.lang);
  const fields = parseFormFields(data.eventRow.custom_form_fields);
  const seatsLeft = Math.max(event.maxCapacity - event.seatsTaken, 0);

  const date = new Date(event.eventDate);
  const dateLabel = new Intl.DateTimeFormat(localeTag[data.lang], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jerusalem",
  }).format(date);

  return (
    <TenantShell org={org} lang={data.lang} t={t}>
      <Link
        href={localizedPath(data.lang, `/${org.slug}`)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white"
      >
        <ArrowRight aria-hidden className="size-4 ltr:rotate-180" />
        {t.event.backTo(org.name)}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_440px]">
        {/* פרטי האירוע */}
        <section>
          <div
            className="relative h-56 overflow-hidden rounded-3xl sm:h-72"
            style={{
              background: event.coverImageUrl
                ? `center / cover no-repeat url(${event.coverImageUrl})`
                : "radial-gradient(120% 120% at 15% 10%, var(--brand) 0%, transparent 55%), radial-gradient(120% 120% at 90% 90%, var(--brand-2) 0%, transparent 55%), #120f1f",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute start-5 top-5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
              {t.tenant.categories[event.category]}
            </span>
            <h1 className="absolute bottom-5 start-5 end-5 text-3xl font-black leading-tight sm:text-4xl">{event.title}</h1>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <CalendarDays className="mt-0.5 size-5 text-[color:var(--brand-2)]" />
              <div>
                <dt className="text-xs text-muted">{t.event.date}</dt>
                <dd className="font-semibold">{dateLabel}</dd>
              </div>
            </div>
            {event.location && (
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <MapPin className="mt-0.5 size-5 text-[color:var(--brand-2)]" />
                <div>
                  <dt className="text-xs text-muted">{t.event.location}</dt>
                  <dd className="font-semibold">{event.location}</dd>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Ticket className="mt-0.5 size-5 text-[color:var(--brand-2)]" />
              <div>
                <dt className="text-xs text-muted">{t.event.price}</dt>
                <dd className="font-semibold">{event.price === 0 ? t.common.free : `${t.common.currency}${event.price}`}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Users className="mt-0.5 size-5 text-[color:var(--brand-2)]" />
              <div>
                <dt className="text-xs text-muted">{t.tenant.capacity(event.seatsTaken, event.maxCapacity)}</dt>
                <dd className={`font-semibold ${seatsLeft <= 5 ? "text-pink-300" : ""}`}>
                  {seatsLeft === 0 ? t.common.soldOut : t.common.seatsLeft(seatsLeft)}
                </dd>
              </div>
            </div>
          </dl>

          {event.description && (
            <div className="mt-8">
              <h2 className="text-xl font-bold">{t.event.about}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-white/80">{event.description}</p>
            </div>
          )}
        </section>

        {/* הרשמה */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          {seatsLeft === 0 ? (
            <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-lg font-semibold text-pink-200">
              {t.register.full}
            </p>
          ) : (
            <RegistrationFlow eventId={event.id} lang={data.lang} fields={fields} t={t.register} />
          )}
        </aside>
      </div>
    </TenantShell>
  );
}
