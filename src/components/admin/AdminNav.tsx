"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { localizedPath, stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/he";

// פריטי הניווט — יתווספו כאן אירועים / מחולל AI / נוכחות כשייבנו
const items = [{ href: "/admin", key: "approvals", icon: ClipboardCheck }] as const;

export function AdminNav({ lang, t }: { lang: Locale; t: Dictionary["admin"]["nav"] }) {
  const current = stripLocale(usePathname() ?? "/");

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {items.map(({ href, key, icon: Icon }) => {
        // "/admin" פעיל רק בדיוק; שאר הפריטים פעילים גם בתתי-עמודים שלהם
        const active = current === href || (href !== "/admin" && current.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={localizedPath(lang, href)}
            aria-current={active ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
              active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="size-4" />
            {t[key]}
          </Link>
        );
      })}
    </nav>
  );
}
