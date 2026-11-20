import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, localizedPath } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { VibeoLogo } from "@/components/brand/VibeoLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LoginForm } from "@/components/admin/LoginForm";

export async function generateMetadata({ params }: PageProps<"/[lang]/login">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return { title: `${t.login.title} · Vibeo`, robots: { index: false } };
}

export default async function LoginPage({ params }: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <main className="aurora relative grid min-h-screen place-items-center px-4 py-16">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher lang={lang} label={t.common.languageSwitch} />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <Link href={localizedPath(lang, "/")} aria-label={t.nav.home}>
          <VibeoLogo size={40} />
        </Link>
        <h1 className="mt-8 text-2xl font-bold">{t.login.title}</h1>
        <p className="mt-1 mb-6 text-sm text-muted">{t.login.subtitle}</p>
        <LoginForm lang={lang} t={t.login} />
      </div>
    </main>
  );
}
