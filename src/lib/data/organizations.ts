import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Locale } from "@/i18n/config";
import type { Enums, Json, Tables } from "@/types/database";

// ---------------------------------------------------------------------------
// שכבת נתונים ציבורית: ארגונים ואירועים פעילים.
// הקריאות נשמרות במטמון ('use cache') ומתרעננות כל דקה; אחרי שינוי ע״י מנהל
// אפשר לרענן מיד עם updateTag / revalidateTag על התגיות שלמטה.
// ---------------------------------------------------------------------------

export const orgTag = (slug: string) => `org:${slug}`;
export const orgEventsTag = (organizationId: string) => `org-events:${organizationId}`;
export const ORGANIZATIONS_TAG = "organizations";

type OrganizationRow = Tables<"organizations">;
type EventRow = Tables<"events">;

export type EventCategory = Enums<"event_category">;
export type BrandColors = { primary: string; secondary: string };

/** ארגון מוכן לתצוגה — שדות מתורגמים לשפה הנבחרת */
export type OrganizationView = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  brandColors: BrandColors;
};

/** אירוע מוכן לתצוגה — שדות מתורגמים לשפה הנבחרת */
export type EventView = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  category: EventCategory;
  eventDate: string;
  maxCapacity: number;
  seatsTaken: number;
  price: number;
  coverImageUrl: string | null;
};

const DEFAULT_BRAND: BrandColors = { primary: "#8b5cf6", secondary: "#22d3ee" };
const HEX_COLOR = /^#[0-9a-f]{3,8}$/i;

// ---------- שאילתות (עם מטמון) ----------

export async function listOrganizationSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(ORGANIZATIONS_TAG);

  const { data, error } = await createPublicClient().from("organizations").select("slug");
  if (error) throw new Error(`שגיאה בטעינת רשימת הארגונים: ${error.message}`);
  return data.map((o) => o.slug);
}

export async function getOrganizationBySlug(slug: string): Promise<OrganizationRow | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(orgTag(slug));

  const { data, error } = await createPublicClient()
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`שגיאה בטעינת הארגון "${slug}": ${error.message}`);
  return data;
}

export async function getActiveEvents(organizationId: string): Promise<EventRow[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(orgEventsTag(organizationId));

  // RLS מחזיר לאורחים רק אירועים פעילים; הסינון כאן מפורש לביטחון
  const { data, error } = await createPublicClient()
    .from("events")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("event_date", { ascending: true });
  if (error) throw new Error(`שגיאה בטעינת האירועים: ${error.message}`);
  return data;
}

// ---------- המרה לתצוגה לפי שפה ----------

/** מחזיר שדה מתורגם מתוך עמודת i18n ({"en": {"title": "..."}}), או את ערך ברירת המחדל */
function translated(i18n: Json, lang: Locale, field: string, fallback: string | null): string | null {
  if (i18n && typeof i18n === "object" && !Array.isArray(i18n)) {
    const forLang = i18n[lang];
    if (forLang && typeof forLang === "object" && !Array.isArray(forLang)) {
      const value = forLang[field];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return fallback;
}

function parseBrandColors(json: Json): BrandColors {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const { primary, secondary } = json;
    if (typeof primary === "string" && HEX_COLOR.test(primary) && typeof secondary === "string" && HEX_COLOR.test(secondary)) {
      return { primary, secondary };
    }
  }
  return DEFAULT_BRAND;
}

export function toOrganizationView(row: OrganizationRow, lang: Locale): OrganizationView {
  return {
    id: row.id,
    slug: row.slug,
    name: translated(row.i18n, lang, "name", row.name) ?? row.name,
    tagline: translated(row.i18n, lang, "tagline", row.tagline),
    logoUrl: row.logo_url,
    brandColors: parseBrandColors(row.brand_colors),
  };
}

export function toEventView(row: EventRow, lang: Locale): EventView {
  return {
    id: row.id,
    title: translated(row.i18n, lang, "title", row.title) ?? row.title,
    description: translated(row.i18n, lang, "description", row.description),
    location: translated(row.i18n, lang, "location", row.location),
    category: row.category,
    eventDate: row.event_date,
    maxCapacity: row.max_capacity,
    seatsTaken: row.seats_taken,
    price: Number(row.price),
    coverImageUrl: row.cover_image_url,
  };
}
