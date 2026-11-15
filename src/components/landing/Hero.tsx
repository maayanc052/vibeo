"use client";

import { motion, type Variants } from "framer-motion";
import { PlayCircle, ShieldCheck, Sparkles, BellRing } from "lucide-react";
import { ForwardArrow } from "@/components/i18n/ForwardArrow";
import type { Dictionary } from "@/i18n/dictionaries/he";

const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const highlightIcons = [ShieldCheck, BellRing, Sparkles];

export function Hero({ t }: { t: Dictionary["hero"] }) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      {/* שכבת רקע: גרדיאנט פרוצדורלי תמידי + וידאו (אם הוגדר) */}
      <div className="aurora absolute inset-0 -z-30" aria-hidden />
      {videoUrl && (
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-60"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/40 to-background" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-6xl px-4 pb-20 pt-36"
      >
        <div className="max-w-3xl rounded-3xl border border-white/10 bg-black/25 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-cyan-300" />
            {t.badge}
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl"
          >
            {t.titleStart}{" "}
            <span className="bg-gradient-to-l from-violet-300 via-cyan-200 to-pink-300 bg-clip-text text-transparent">
              {t.titleHighlight}
            </span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            {t.subtitle}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#start"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-black transition hover:bg-white/90"
            >
              {t.primaryCta}
              <ForwardArrow className="size-5 transition-transform rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
            </a>
            <a
              href="#events"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <PlayCircle className="size-5" />
              {t.secondaryCta}
            </a>
          </motion.div>

          <motion.ul variants={item} className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
            {t.highlights.map((label, i) => {
              const Icon = highlightIcons[i] ?? Sparkles;
              return (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-cyan-300" />
                  {label}
                </li>
              );
            })}
          </motion.ul>
        </div>
      </motion.div>
    </section>
  );
}
