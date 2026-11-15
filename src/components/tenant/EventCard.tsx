import {
  CalendarDays,
  MapPin,
  Users,
  ChefHat,
  HeartHandshake,
  Presentation,
  Mic2,
  Mountain,
  type LucideIcon,
} from "lucide-react";
import { ForwardArrow } from "@/components/i18n/ForwardArrow";
import { localeTag, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/he";
import type { EventCategory, EventView } from "@/lib/data/organizations";

const categoryIcon: Record<EventCategory, LucideIcon> = {
  team: Users,
  workshops: ChefHat,
  community: HeartHandshake,
  conferences: Presentation,
  volunteering: Mic2,
  outdoor: Mountain,
};

type Props = {
  event: EventView;
  lang: Locale;
  t: Dictionary;
};

export function EventCard({ event, lang, t }: Props) {
  const Icon = categoryIcon[event.category];
  const seatsLeft = Math.max(event.maxCapacity - event.seatsTaken, 0);
  const fill = Math.min(100, Math.round((event.seatsTaken / event.maxCapacity) * 100));
  const soldOut = seatsLeft === 0;

  const date = new Date(event.eventDate);
  const dateLabel = new Intl.DateTimeFormat(localeTag[lang], {
    weekday: "short",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jerusalem",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat(localeTag[lang], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jerusalem",
  }).format(date);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[color:var(--brand)]/60">
      {/* כיסוי פרוצדורלי בצבעי המותג (עד שתועלה תמונת כיסוי) */}
      <div
        className="relative h-36 overflow-hidden"
        style={{
          background: event.coverImageUrl
            ? `center / cover no-repeat url(${event.coverImageUrl})`
            : "radial-gradient(120% 120% at 15% 10%, var(--brand) 0%, transparent 55%), radial-gradient(120% 120% at 90% 90%, var(--brand-2) 0%, transparent 55%), #120f1f",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Icon className="absolute bottom-4 end-4 size-12 text-white/25 transition group-hover:scale-110" aria-hidden />
        <span className="absolute start-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
          {t.tenant.categories[event.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug">{event.title}</h3>
        {event.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{event.description}</p>}

        <ul className="mt-4 space-y-1.5 text-sm text-white/75">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[color:var(--brand-2)]" />
            {dateLabel} · <span dir="ltr">{timeLabel}</span>
          </li>
          {event.location && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-[color:var(--brand-2)]" />
              {event.location}
            </li>
          )}
        </ul>

        {/* תפוסה */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted">
            <span>{t.tenant.capacity(event.seatsTaken, event.maxCapacity)}</span>
            <span className={soldOut || seatsLeft <= 5 ? "text-pink-300" : ""}>
              {soldOut ? t.common.soldOut : t.common.seatsLeft(seatsLeft)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{ width: `${fill}%`, background: "linear-gradient(90deg, var(--brand), var(--brand-2))" }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 pt-1">
          <span className="text-lg font-black">
            {event.price === 0 ? t.common.free : `${t.common.currency}${event.price}`}
          </span>
          <button
            type="button"
            disabled={soldOut}
            title={t.tenant.registrationSoon}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "linear-gradient(90deg, var(--brand), var(--brand-2))" }}
          >
            {soldOut ? t.common.soldOut : t.tenant.register}
            {!soldOut && <ForwardArrow />}
          </button>
        </div>
      </div>
    </article>
  );
}
