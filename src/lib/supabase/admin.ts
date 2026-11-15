import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * לקוח עם הרשאות מלאות (עוקף RLS) — לשרת בלבד!
 * משמש לפעולות מערכת: אישורי RSVP לפי טוקן, תשלומים, תזכורות ויומן התראות.
 * לעולם אין לייבא קובץ זה מרכיב לקוח.
 */
export function createSupabaseAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("חסר משתנה הסביבה SUPABASE_SERVICE_ROLE_KEY (מוגדר רק בשרת / ב-Vercel)");
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
