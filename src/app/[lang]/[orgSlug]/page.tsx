import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { hasLocale, localizedPath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { demoOrganizations, getDemoEvents, getDemoOrganization } from "@/lib/demo-orgs";
import { VibeoLogo } from "@/components/brand/VibeoLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { OrgLogo } from "@/components/tenant/OrgLogo";
import { EventCard } from "@/components/tenant/EventCard";

// סביבות הדמו נבנות מראש; סלאגים אחרים ייבדקו בזמן הבקשה
export function generateStaticParams() {
  return demoOrganizations.map((o) => ({ orgSlug: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[orgSlug]">): Promise<Metadata> {
  const { lang, orgSlug } = await params;
  const org = getDemoOrganization(orgSlug);
  if (!hasLocale(lang) || !org) return {};
  return {
    title: `${org.name[lang]} · Vibeo`,
    description: org.tagline[lang],
  };
}

export default async function OrgPage({ params }: PageProps<"/[lang]/[orgSlug]">) {
  const { lang, orgSlug } = await params;
  if (!hasLocale(lang)) notFound();

  const org = getDemoOrganization(orgSlug);
  if (!org) notFound();

  const t = await getDictionary(lang);
  const events = getDemoEvents(org.id);
  const orgName = org.name[lang];

  // צבעי המותג של הארגון זמינים לכל הרכיבים דרך משתני CSS
  const brandStyle = {
    "--brand": org.brand_colors.primary,
    "--brand-2": org.brand_colors.secondary,
  } as CSSProperties;

  return (
    <div style={brandStyle} className="relative min-h-screen overflow-hidden">
      {/* זוהר רקע בצבעי המותג */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-40"
        style={{
          background:
            "radial-gradient(50% 60% at 25% 0%, var(--brand), transparent 70%), radial-gradient(40% 50% at 85% 10%, var(--brand-2), transparent 70%)",
        }}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
        <div className="flex items-center gap-3">
          <OrgLogo name={orgName} logoUrl={org.logo_url} colors={org.brand_colors} size={44} />
          <span className="text-lg font-bold">{orgName}</span>
        </div>
        <LanguageSwitcher lang={lang} label={t.common.languageSwitch} />
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        <section className="py-14 sm:py-20">
          <OrgLogo name={orgName} logoUrl={org.logo_url} colors={org.brand_colors} size={72} />
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">{orgName}</h1>
          <p className="mt-3 text-lg text-muted sm:text-xl">{org.tagline[lang]}</p>
        </section>

        <p className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted">
          <Info className="size-3.5" />
          {t.tenant.demoNotice}
        </p>

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
                <EventCard key={e.id} event={e} lang={lang} t={t} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 text-sm text-muted">
          <span>
            © 2026 {orgName}
          </span>
          <Link href={localizedPath(lang, "/")} className="inline-flex items-center gap-2 hover:text-white">
            {t.common.poweredBy}
            <VibeoLogo size={22} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
