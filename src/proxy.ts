import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * Proxy — רץ לפני כל בקשה לדף:
 *
 * 1) ניתוב שפות:
 *    - /en/...  → מוצג כמו שהוא (אנגלית)
 *    - /he/...  → הפניה לכתובת הנקייה ללא קידומת
 *    - כל השאר → rewrite פנימי ל-/he/... (עברית כברירת מחדל, בלי לשנות את הכתובת בדפדפן)
 *
 * 2) רענון חיבור Supabase — רק למשתמשים מחוברים (יש עוגיית sb-*), כדי לא להאט אורחים.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefixed = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (prefixed === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url);
  }

  const rewriteUrl = prefixed ? null : request.nextUrl.clone();
  if (rewriteUrl) rewriteUrl.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;

  const buildResponse = () =>
    rewriteUrl ? NextResponse.rewrite(rewriteUrl, { request }) : NextResponse.next({ request });

  let response = buildResponse();

  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (hasSession && url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = buildResponse();
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    });
    // מאמת ומרענן את הטוקן במידת הצורך (העוגיות המעודכנות נכתבות לתשובה)
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  // דילוג על קבצים פנימיים, API וקבצים סטטיים (כל מה שיש בו נקודה)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
