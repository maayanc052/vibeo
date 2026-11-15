import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * ניתוב שפות:
 * - /en/...  → מוצג כמו שהוא (אנגלית)
 * - /he/...  → הפניה לכתובת הנקייה ללא קידומת
 * - כל השאר → rewrite פנימי ל-/he/... (עברית כברירת מחדל, בלי לשנות את הכתובת בדפדפן)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const prefixed = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (prefixed === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url);
  }

  if (prefixed) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // דילוג על קבצים פנימיים, API וקבצים סטטיים (כל מה שיש בו נקודה)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
