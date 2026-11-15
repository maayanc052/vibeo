import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  getActiveEvents,
  getOrganizationBySlug,
  listOrganizationSlugs,
  toEventView,
  toOrganizationView,
} from "@/lib/data/organizations";
import { OrgLogo } from "@/components/tenant/OrgLogo";
import { EventCard } from "@/components/tenant/EventCard";
import { TenantShell } from "@/components/tenant/TenantShell";

// כל הארגונים הקיימים נבנים מראש; ארגון חדש ייבנה בבקשה הראשונה אליו
export async function generateStaticParams() {
  const slugs = await listOrganizationSlugs();
  return slugs.map((orgSlug) => ({ orgSlug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[orgSlug]">): Promise<Metadata> {
  const { lang, orgSlug } = await params;
  if (!hasLocale(lang)) return {};
  const row = await getOrganizationBySlug(orgSlug);
  if (!row) return {};
  const org = toOrganizationView(row, lang);
  return {
    title: `${org.name} · Vibeo`,
    description: org.tagline ?? undefined,
  };
}

export default async function OrgPage({ params }: PageProps<"/[lang]/[orgSlug]">) {
  const { lang, orgSlug } = await params;
  if (!hasLocale(lang)) notFound();

  const row = await getOrganizationBySlug(orgSlug);
  if (!row) notFound();

  const [t, eventRows] = await Promise.all([getDictionary(lang), getActiveEvents(row.id)]);
  const org = toOrganizationView(row, lang);
  const events = eventRows.map((e) => toEventView(e, lang));

  return (
    <TenantShell org={org} lang={lang} t={t}>
      <section className="py-14 sm:py-20">
        <OrgLogo name={org.name} logoUrl={org.logoUrl} colors={org.brandColors} size={72} />
        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">{org.name}</h1>
        {org.tagline && <p className="mt-3 text-lg text-muted sm:text-xl">{org.tagline}</p>}
      </section>

      <section aria-labelledby="upcoming-title">
        <div className="mb-6">
          <h2 id="upcoming-title" className="text-2xl font-bold sm:text-3xl">
            {t.tenant.upcoming}
          </h2>
          <p className="mt-1 text-sm text-muted">{t.tenant.upcomingSub(events.length)}</p>
        </div>

        {events.length === 0 ? (
          <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-muted">
            {t.tenant.empty}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} orgSlug={org.slug} lang={lang} t={t} />
            ))}
          </div>
        )}
      </section>
    </TenantShell>
  );
}
