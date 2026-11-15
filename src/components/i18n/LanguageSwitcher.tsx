"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { localizedPath, stripLocale, type Locale } from "@/i18n/config";

type Props = {
  lang: Locale;
  label: string;
  className?: string;
};

/** מעבר בין עברית לאנגלית — שומר על אותו עמוד */
export function LanguageSwitcher({ lang, label, className = "" }: Props) {
  const pathname = usePathname() ?? "/";
  const target: Locale = lang === "he" ? "en" : "he";
  const href = localizedPath(target, stripLocale(pathname));

  return (
    <Link
      href={href}
      hrefLang={target}
      title={label}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white ${className}`}
    >
      <Languages className="size-4" />
      <span className="font-semibold uppercase">{target === "en" ? "EN" : "עב"}</span>
    </Link>
  );
}
