"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { VibeoLogo } from "@/components/brand/VibeoLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ForwardArrow } from "@/components/i18n/ForwardArrow";
import { localizedPath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/he";

type Props = {
  lang: Locale;
  t: Dictionary["nav"];
  switchLabel: string;
};

export function FloatingNav({ lang, t, switchLabel }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-50 px-4"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_8px_40px_-12px_rgb(0_0_0/0.6)] backdrop-blur-xl">
        <Link href={localizedPath(lang, "/")} aria-label={t.home}>
          <VibeoLogo size={34} />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {t.links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-xl px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher lang={lang} label={switchLabel} />
          <a
            href="#login"
            className="hidden rounded-xl px-3 py-2 text-sm text-white/80 transition hover:text-white sm:inline-block"
          >
            {t.login}
          </a>
          <a
            href="#start"
            className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-violet-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
          >
            {t.cta}
            <ForwardArrow className="size-4 transition-transform rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl p-2 text-white/80 hover:bg-white/10 md:hidden"
            aria-label={open ? t.closeMenu : t.openMenu}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl md:hidden"
          >
            {t.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-white/85 hover:bg-white/10"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
