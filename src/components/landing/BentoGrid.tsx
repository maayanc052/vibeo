import {
  CalendarDays,
  Users,
  Sparkles,
  QrCode,
  Lightbulb,
  ChefHat,
  Mountain,
  Presentation,
  HeartHandshake,
  Mic2,
  Check,
  Clock,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { BentoCard } from "./BentoCard";
import { ForwardArrow } from "@/components/i18n/ForwardArrow";
import type { Dictionary } from "@/i18n/dictionaries/he";

// קטגוריות: מפתח → אייקון + מספר אירועים (נתוני דמו עד חיבור Supabase)
const categoryMeta: { key: keyof Dictionary["bento"]["categories"]["items"]; icon: LucideIcon; count: number }[] = [
  { key: "team", icon: Users, count: 24 },
  { key: "workshops", icon: ChefHat, count: 41 },
  { key: "community", icon: HeartHandshake, count: 18 },
  { key: "conferences", icon: Presentation, count: 9 },
  { key: "volunteering", icon: Mic2, count: 12 },
  { key: "outdoor", icon: Mountain, count: 15 },
];

export function BentoGrid({ t }: { t: Dictionary }) {
  const b = t.bento;

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold text-cyan-300">{b.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{b.title}</h2>
        <p className="mt-4 text-lg text-muted">{b.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* קטגוריות — כרטיס רחב */}
        <BentoCard id="events" className="md:col-span-7 md:row-span-2">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
              <CalendarDays className="size-5" />
            </span>
            <h3 className="text-2xl font-bold">{b.categories.title}</h3>
          </div>
          <p className="mt-3 max-w-md text-muted">{b.categories.body}</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categoryMeta.map(({ key, icon: Icon, count }) => (
              <a
                key={key}
                href="#workshops"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.07]"
              >
                <Icon className="size-5 text-cyan-300 transition group-hover:scale-110" />
                <div className="mt-3 font-semibold">{b.categories.items[key]}</div>
                <div className="text-xs text-muted">{b.categories.activeEvents(count)}</div>
              </a>
            ))}
          </div>
        </BentoCard>

        {/* AI */}
        <BentoCard className="md:col-span-5" delay={0.05}>
          <span className="grid size-11 place-items-center rounded-2xl bg-pink-500/15 text-pink-300">
            <Sparkles className="size-5" />
          </span>
          <h3 className="mt-4 text-xl font-bold">{b.ai.title}</h3>
          <p className="mt-2 text-muted">{b.ai.body}</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            <span className="text-pink-300">›</span> {b.ai.prompt}
            <span className="ms-1 inline-block h-4 w-1.5 animate-pulse bg-white/70 align-middle" />
          </div>
        </BentoCard>

        {/* QR / RSVP */}
        <BentoCard className="md:col-span-5" delay={0.1}>
          <span className="grid size-11 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-300">
            <QrCode className="size-5" />
          </span>
          <h3 className="mt-4 text-xl font-bold">{b.rsvp.title}</h3>
          <p className="mt-2 text-muted">{b.rsvp.body}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {b.rsvp.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xl font-black" dir="ltr">
                  {s.value}
                </div>
                <div className="text-[11px] text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* חבילות גיבוש */}
        {b.packages.items.map((p, i) => (
          <BentoCard
            key={p.name}
            id={i === 0 ? "team-building" : undefined}
            className={`md:col-span-4 ${p.featured ? "bg-gradient-to-b from-violet-500/15 to-transparent" : ""}`}
            delay={0.05 * i}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{[b.packages.prefix, p.name].filter(Boolean).join(" ")}</h3>
              {p.featured && (
                <span className="rounded-full bg-violet-500/25 px-2.5 py-0.5 text-xs text-violet-200">
                  {b.packages.popular}
                </span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black">{p.price}</span>
              {p.price.startsWith("₪") && <span className="text-sm text-muted">{t.common.perPerson}</span>}
            </div>
            <p className="text-sm text-muted">{p.people}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {p.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Check className="size-4 text-cyan-300" />
                  {perk}
                </li>
              ))}
            </ul>
          </BentoCard>
        ))}

        {/* סדנאות קרובות */}
        <BentoCard id="workshops" className="md:col-span-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
              </span>
              <h3 className="text-xl font-bold">{b.workshops.title}</h3>
            </div>
            <a href="#start" className="inline-flex shrink-0 items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">
              {b.workshops.all}
              <ForwardArrow />
            </a>
          </div>
          <ul className="mt-6 divide-y divide-white/10">
            {b.workshops.items.map((w) => (
              <li key={w.title} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <div className="font-semibold">{w.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                    <Clock className="size-3.5" />
                    {w.date} · {w.time}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${w.seatsLeft <= 5 ? "text-pink-300" : "text-muted"}`}>
                    {t.common.seatsLeft(w.seatsLeft)}
                  </span>
                  <span className="rounded-xl border border-white/15 px-3 py-1.5 text-sm font-semibold">
                    {w.price === 0 ? t.common.free : `₪${w.price}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </BentoCard>

        {/* רעיונות קהילה */}
        <BentoCard id="ideas" className="md:col-span-4" delay={0.1}>
          <span className="grid size-11 place-items-center rounded-2xl bg-amber-500/15 text-amber-300">
            <Lightbulb className="size-5" />
          </span>
          <h3 className="mt-4 text-xl font-bold">{b.ideas.title}</h3>
          <p className="mt-2 text-muted">{b.ideas.body}</p>
          <ul className="mt-5 space-y-2 text-sm">
            {b.ideas.items.map((idea) => (
              <li key={idea.title} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2">
                {idea.title}
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <ThumbsUp className="size-3.5" />
                  {idea.votes}
                </span>
              </li>
            ))}
          </ul>
        </BentoCard>
      </div>
    </section>
  );
}
