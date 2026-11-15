import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/he";
import type { OrganizationView } from "@/lib/data/organizations";
import { VibeoLogo } from "@/components/brand/VibeoLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { OrgLogo } from "./OrgLogo";

type Props = {
  org: OrganizationView;
  lang: Locale;
  t: Dictionary;
  children: ReactNode;
};

/** מסגרת משותפת לעמודי הארגון: צבעי מותג, כותרת עם לוגו, מתג שפה ופוטר */
export function TenantShell({ org, lang, t, children }: Props) {
  // צבעי המותג של הארגון זמינים לכל הרכיבים דרך משתני CSS
  const brandStyle = {
    "--brand": org.brandColors.primary,
    "--brand-2": org.brandColors.secondary,
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
        <Link href={localizedPath(lang, `/${org.slug}`)} className="flex items-center gap-3">
          <OrgLogo name={org.name} logoUrl={org.logoUrl} colors={org.brandColors} size={44} />
          <span className="text-lg font-bold">{org.name}</span>
        </Link>
        <LanguageSwitcher lang={lang} label={t.common.languageSwitch} />
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">{children}</main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 text-sm text-muted">
          <span>© 2026 {org.name}</span>
          <Link href={localizedPath(lang, "/")} className="inline-flex items-center gap-2 hover:text-white">
            {t.common.poweredBy}
            <VibeoLogo size={22} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
