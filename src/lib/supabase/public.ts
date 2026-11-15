import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * לקוח לקריאת מידע ציבורי בלבד (ארגונים, אירועים פעילים) — ללא עוגיות וללא משתמש.
 * מתאים לשימוש בתוך פונקציות 'use cache' כי אינו תלוי בבקשה הנוכחית.
 */
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
