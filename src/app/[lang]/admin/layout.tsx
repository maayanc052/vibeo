import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Loader2, LogOut, ShieldAlert } from "lucide-react";
import { hasLocale, localizedPath, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { getCurrentProfile } from "@/lib/auth/session";
import { VibeoLogo } from "@/components/brand/VibeoLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "../login/actions";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/admin">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return { title: `${t.admin.title} · Vibeo`, robots: { index: false } };
}

/**
 * מסגרת לוח הניהול. החלק הקבוע (כותרת וניווט) נבנה מראש;
 * בדיקת ההרשאה והתוכן תלויים במשתמש המחובר ולכן עטופים ב-Suspense.
 */
export default async function AdminLayout({ children, params }: LayoutProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_40%_at_80%_0%,rgb(139_92_246/0.18),transparent)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href={localizedPath(lang, "/admin")} aria-label={t.admin.title}>
              <VibeoLogo size={30} />
            </Link>
            <AdminNav lang={lang} t={t.admin.nav} />
          </div>
          <div className="flex items-center gap-1">
            <Link href={localizedPath(lang, "/")} className="rounded-xl px-3 py-2 text-sm text-white/65 hover:text-white">
              {t.admin.backToSite}
            </Link>
            <LanguageSwitcher lang={lang} label={t.common.languageSwitch} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Suspense
          fallback={
            <div className="grid place-items-center py-24 text-muted">
              <Loader2 className="size-8 animate-spin" />
            </div>
          }
        >
          <AdminGate lang={lang} t={t}>
            {children}
          </AdminGate>
        </Suspense>
      </main>
    </div>
  );
}

/** בודק שהמשתמש מחובר ושהוא מנהל — אחרת מפנה לכניסה או מציג "אין הרשאה" */
async function AdminGate({ lang, t, children }: { lang: Locale; t: Dictionary; children: ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(localizedPath(lang, "/login"));

  const signOutWithLang = signOut.bind(null, lang);

  const userBar = (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
      <span className="text-muted">
        {t.admin.signedInAs}{" "}
        <span className="font-semibold text-white">{profile.full_name || profile.email}</span>
        <span className="ms-2 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-200">
          {t.admin.roles[profile.role]}
        </span>
      </span>
      <form action={signOutWithLang}>
        <button type="submit" className="inline-flex items-center gap-1.5 text-muted hover:text-white">
          <LogOut className="size-4" />
          {t.admin.signOut}
        </button>
      </form>
    </div>
  );

  if (profile.role === "user") {
    return (
      <>
        {userBar}
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <ShieldAlert className="mx-auto size-12 text-amber-300" />
          <h1 className="mt-4 text-xl font-bold">{t.admin.noAccessTitle}</h1>
          <p className="mt-2 text-muted">{t.admin.noAccessBody}</p>
        </div>
      </>
    );
  }

  return (
    <>
      {userBar}
      {children}
    </>
  );
}
