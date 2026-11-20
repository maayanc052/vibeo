import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type RegistrationStatus = Enums<"registration_status">;
export const REGISTRATION_STATUSES: RegistrationStatus[] = ["pending_approval", "approved", "paid", "cancelled"];

/**
 * הרשמות לפי סטטוס, עם פרטי האירוע, הארגון והנרשם.
 * RLS מגביל אוטומטית: מנהל ארגון רואה רק את הארגון שלו, מנהל מערכת רואה הכול.
 */
export async function listRegistrations(status: RegistrationStatus) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `id, status, rsvp_status, created_at, custom_answers,
       event:events ( id, title, event_date, price, custom_form_fields, organization:organizations ( name, slug ) ),
       profile:profiles ( full_name, email )`,
    )
    .eq("status", status)
    .order("created_at", { ascending: status === "pending_approval" })
    .limit(200);
  if (error) throw new Error(`שגיאה בטעינת ההרשמות: ${error.message}`);
  return data;
}

export type AdminRegistration = Awaited<ReturnType<typeof listRegistrations>>[number];

/** מספר ההרשמות בכל סטטוס — למונים בלשוניות */
export async function countRegistrationsByStatus(): Promise<Record<RegistrationStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const counts = await Promise.all(
    REGISTRATION_STATUSES.map(async (s) => {
      const { count } = await supabase.from("registrations").select("id", { count: "exact", head: true }).eq("status", s);
      return [s, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<RegistrationStatus, number>;
}
