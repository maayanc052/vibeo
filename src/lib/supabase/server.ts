import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * לקוח צד-שרת עם הקשר המשתמש המחובר (דרך עוגיות).
 * לשימוש ב-Server Components, Server Actions ו-Route Handlers.
 * שימו לב: קריאה ל-cookies() הופכת את הרכיב לדינמי — יש לעטוף ב-<Suspense> בדפים.
 */
export async function createSupabaseServerClient() {
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // נקרא מתוך Server Component (שם אי אפשר לכתוב עוגיות) — הרענון יתבצע ב-proxy
        }
      },
    },
  });
}
