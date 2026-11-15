// הגדרות שפה משותפות — נטען גם ב-proxy וגם ברכיבי לקוח, לכן ללא תלויות שרת

export const locales = ["he", "en"] as const;
export type Locale = (typeof locales)[number];

/** שפת ברירת המחדל — כתובות בעברית ללא קידומת (/acme), אנגלית עם קידומת (/en/acme) */
export const defaultLocale: Locale = "he";

export const localeDir: Record<Locale, "rtl" | "ltr"> = {
  he: "rtl",
  en: "ltr",
};

export const localeLabel: Record<Locale, string> = {
  he: "עברית",
  en: "English",
};

/** תגית BCP-47 לעיצוב תאריכים ומספרים */
export const localeTag: Record<Locale, string> = {
  he: "he-IL",
  en: "en-US",
};

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** בונה נתיב לפי שפה: he → "/acme", en → "/en/acme" */
export function localizedPath(locale: Locale, path: string = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** מסיר קידומת שפה מנתיב: "/en/acme" → "/acme" */
export function stripLocale(pathname: string): string {
  for (const l of locales) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

/** טקסט מתורגם לתוכן דינמי (נתוני דמו / מסד נתונים) */
export type Localized = Record<Locale, string>;
