// נתוני דמו לסביבות ארגון — מבנה תואם לטבלאות organizations / events במסד הנתונים.
// בשלב 3 יוחלפו בשאילתות Supabase (getOrganizationBySlug / getActiveEvents).
import type { Localized } from "@/i18n/config";

export type BrandColors = { primary: string; secondary: string };

export type DemoOrganization = {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  logo_url: string | null;
  brand_colors: BrandColors;
};

export type EventCategory = "team" | "workshops" | "community" | "conferences" | "volunteering" | "outdoor";

export type DemoEvent = {
  id: string;
  organization_id: string;
  title: Localized;
  description: Localized;
  location: Localized;
  category: EventCategory;
  event_date: string; // ISO 8601
  max_capacity: number;
  registered_count: number; // יחושב בעתיד מטבלת registrations
  price: number; // בשקלים, 0 = חינם
  cover_image_url: string | null;
  is_active: boolean;
};

export const demoOrganizations: DemoOrganization[] = [
  {
    id: "org_nova",
    slug: "nova-labs",
    name: { he: "נובה לאבס", en: "Nova Labs" },
    tagline: { he: "הצוות שלנו, החוויות שלנו", en: "Our team, our experiences" },
    logo_url: null,
    brand_colors: { primary: "#8b5cf6", secondary: "#22d3ee" },
  },
  {
    id: "org_shaked",
    slug: "kehilat-hashaked",
    name: { he: "קהילת השקד", en: "Almond Community" },
    tagline: { he: "נפגשים, יוצרים, מתנדבים — ביחד", en: "Meet, create, volunteer — together" },
    logo_url: null,
    brand_colors: { primary: "#10b981", secondary: "#f59e0b" },
  },
];

export const demoEvents: DemoEvent[] = [
  {
    id: "evt_1",
    organization_id: "org_nova",
    title: { he: "יום גיבוש בגליל העליון", en: "Team day in the Upper Galilee" },
    description: {
      he: "קיאקים בירדן, ארוחת צהריים כשרה ומשחק צוותי בשטח. הסעות מהמשרד.",
      en: "Kayaking on the Jordan, a kosher lunch and an outdoor team game. Shuttles from the office.",
    },
    location: { he: "כפר בלום", en: "Kfar Blum" },
    category: "team",
    event_date: "2026-12-03T08:00:00+02:00",
    max_capacity: 80,
    registered_count: 61,
    price: 0,
    cover_image_url: null,
    is_active: true,
  },
  {
    id: "evt_2",
    organization_id: "org_nova",
    title: { he: "סדנת בישול צוותית", en: "Team cooking workshop" },
    description: {
      he: "שפים מובילים, תחנות עבודה בקבוצות וארוחה משותפת בסוף הערב.",
      en: "Leading chefs, group cooking stations and a shared dinner at the end.",
    },
    location: { he: "תל אביב", en: "Tel Aviv" },
    category: "workshops",
    event_date: "2026-11-24T18:00:00+02:00",
    max_capacity: 24,
    registered_count: 18,
    price: 180,
    cover_image_url: null,
    is_active: true,
  },
  {
    id: "evt_3",
    organization_id: "org_nova",
    title: { he: "כנס חדשנות שנתי", en: "Annual innovation summit" },
    description: {
      he: "הרצאות, דמו של צוותי המוצר ופאנל על עתיד העבודה.",
      en: "Talks, product team demos and a panel on the future of work.",
    },
    location: { he: "מרכז הכנסים, חיפה", en: "Convention Center, Haifa" },
    category: "conferences",
    event_date: "2027-01-14T09:30:00+02:00",
    max_capacity: 300,
    registered_count: 124,
    price: 0,
    cover_image_url: null,
    is_active: true,
  },
  {
    id: "evt_4",
    organization_id: "org_shaked",
    title: { he: "יום התנדבות בחווה החקלאית", en: "Volunteering day at the farm" },
    description: {
      he: "קטיף, אריזת סלי מזון למשפחות ופיקניק משותף.",
      en: "Harvesting, packing food baskets for families and a shared picnic.",
    },
    location: { he: "עמק חפר", en: "Hefer Valley" },
    category: "volunteering",
    event_date: "2026-11-27T08:30:00+02:00",
    max_capacity: 50,
    registered_count: 50,
    price: 0,
    cover_image_url: null,
    is_active: true,
  },
  {
    id: "evt_5",
    organization_id: "org_shaked",
    title: { he: "ערב קהילה: מוזיקה מסביב למדורה", en: "Community night: music by the bonfire" },
    description: {
      he: "שירה בציבור, כיבוד קל ומפגש שכנים חדשים.",
      en: "Sing-along, light refreshments and meeting new neighbors.",
    },
    location: { he: "הגבעה המרכזית", en: "The central hill" },
    category: "community",
    event_date: "2026-12-10T19:00:00+02:00",
    max_capacity: 120,
    registered_count: 47,
    price: 25,
    cover_image_url: null,
    is_active: true,
  },
];

export function getDemoOrganization(slug: string): DemoOrganization | undefined {
  return demoOrganizations.find((o) => o.slug === slug);
}

export function getDemoEvents(organizationId: string): DemoEvent[] {
  return demoEvents
    .filter((e) => e.organization_id === organizationId && e.is_active)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
}
