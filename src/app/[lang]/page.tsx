import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { FloatingNav } from "@/components/landing/FloatingNav";
import { Hero } from "@/components/landing/Hero";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { Footer } from "@/components/landing/Footer";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);

  return (
    <>
      <FloatingNav lang={lang} t={t.nav} switchLabel={t.common.languageSwitch} />
      <main>
        <Hero t={t.hero} />
        <BentoGrid t={t} />
      </main>
      <Footer rights={t.common.rights} />
    </>
  );
}
