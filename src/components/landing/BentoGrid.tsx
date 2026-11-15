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
  Tent,
  Mic2,
  Check,
  Clock,
  ArrowLeft,
  ThumbsUp,
} from "lucide-react";
import { BentoCard } from "./BentoCard";
import { categories, packages, workshops, stats } from "@/lib/mock-data";

const categoryIcons = {
  team: Users,
  workshops: ChefHat,
  community: HeartHandshake,
  conferences: Presentation,
  volunteering: Mic2,
  outdoor: Mountain,
} as const;

export function BentoGrid() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-24">
      <div className="mb-12 max-w-2xl">
        <p className="text-sm font-semibold text-cyan-300">הכול במקום אחד</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
          מהרעיון ועד הצ׳ק-אין בכניסה
        </h2>
        <p className="mt-4 text-lg text-muted">
          קטגוריות, חבילות גיבוש וסדנאות קרובות — לכל ארגון סביבה ממותגת משלו.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* קטגוריות — כרטיס רחב */}
        <BentoCard id="events" className="md:col-span-7 md:row-span-2">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
              <CalendarDays className="size-5" />
            </span>
            <h3 className="text-2xl font-bold">קטגוריות אירועים</h3>
          </div>
          <p className="mt-3 max-w-md text-muted">
            בחרו את סוג החוויה — וקבלו טופס הרשמה מותאם, מגבלת משתתפים וסליקה מובנית.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((c) => {
              const Icon = categoryIcons[c.key as keyof typeof categoryIcons] ?? Tent;
              return (
                <a
                  key={c.key}
                  href="#workshops"
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.07]"
                >
                  <Icon className="size-5 text-cyan-300 transition group-hover:scale-110" />
                  <div className="mt-3 font-semibold">{c.label}</div>
                  <div className="text-xs text-muted">{c.count} אירועים פעילים</div>
                </a>
              );
            })}
          </div>
        </BentoCard>

        {/* AI */}
        <BentoCard className="md:col-span-5" delay={0.05}>
          <span className="grid size-11 place-items-center rounded-2xl bg-pink-500/15 text-pink-300">
            <Sparkles className="size-5" />
          </span>
          <h3 className="mt-4 text-xl font-bold">מחולל אירועים חכם</h3>
          <p className="mt-2 text-muted">כתבו משפט אחד — וקבלו טיוטה מלאה: כותרת, לו״ז, תמחור וטופס הרשמה.</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            <span className="text-pink-300">›</span> יום גיבוש ל-40 עובדים בצפון עם ארוחה כשרה
            <span className="ms-1 inline-block h-4 w-1.5 animate-pulse bg-white/70 align-middle" />
          </div>
        </BentoCard>

        {/* QR / RSVP */}
        <BentoCard className="md:col-span-5" delay={0.1}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="grid size-11 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                <QrCode className="size-5" />
              </span>
              <h3 className="mt-4 text-xl font-bold">אישור הגעה בלחיצה + כרטיס QR</h3>
              <p className="mt-2 text-muted">בלי סיסמאות. סריקה בכניסה מהנייד ותזכורות 24 ושעתיים לפני.</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xl font-black" dir="ltr">{s.value}</div>
                <div className="text-[11px] text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* חבילות גיבוש */}
        {packages.map((p, i) => (
          <BentoCard
            key={p.name}
            id={i === 0 ? "team-building" : undefined}
            className={`md:col-span-4 ${p.featured ? "bg-gradient-to-b from-violet-500/15 to-transparent" : ""}`}
            delay={0.05 * i}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">חבילת {p.name}</h3>
              {p.featured && (
                <span className="rounded-full bg-violet-500/25 px-2.5 py-0.5 text-xs text-violet-200">הכי פופולרי</span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black">{p.price}</span>
              {p.price.startsWith("₪") && <span className="text-sm text-muted">למשתתף</span>}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
              </span>
              <h3 className="text-xl font-bold">סדנאות קרובות — בשידור חי</h3>
            </div>
            <a href="#start" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">
              לכל הסדנאות
              <ArrowLeft className="size-4" />
            </a>
          </div>
          <ul className="mt-6 divide-y divide-white/10">
            {workshops.map((w) => (
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
                    נותרו {w.seatsLeft} מקומות
                  </span>
                  <span className="rounded-xl border border-white/15 px-3 py-1.5 text-sm font-semibold">
                    {w.price === 0 ? "חינם" : `₪${w.price}`}
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
          <h3 className="mt-4 text-xl font-bold">קיר הרעיונות</h3>
          <p className="mt-2 text-muted">העובדים מציעים, מצביעים — והאירוע הבא כבר נבחר.</p>
          <ul className="mt-5 space-y-2 text-sm">
            {[
              { t: "טיול זריחה במצדה", v: 87 },
              { t: "האקתון חברתי", v: 54 },
            ].map((idea) => (
              <li key={idea.t} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2">
                {idea.t}
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <ThumbsUp className="size-3.5" />
                  {idea.v}
                </span>
              </li>
            ))}
          </ul>
        </BentoCard>
      </div>
    </section>
  );
}
