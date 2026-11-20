"use server";

import { refresh, updateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { eventTag, orgEventsTag } from "@/lib/data/organizations";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { sendEmail } from "@/lib/email/send";
import { approvalEmail } from "@/lib/email/templates";
import { localizedPath } from "@/i18n/config";
import { siteUrl } from "@/lib/site";
import type { RegistrationStatus } from "@/lib/admin/registrations";

type EmailOutcome = "sent" | "skipped" | "failed" | "none";

const ALLOWED_TARGETS: RegistrationStatus[] = ["approved", "cancelled", "pending_approval"];

/**
 * שינוי סטטוס הרשמה ע״י מנהל: אישור / דחייה / החזרה להמתנה.
 * באישור — נשלח לנרשם מייל (אם שירות המייל מוגדר) ונרשם ביומן ההתראות.
 * RLS מוודא שהמנהל מורשה לארגון של האירוע.
 */
export async function setRegistrationStatus(
  registrationId: string,
  target: RegistrationStatus,
): Promise<ActionResult<{ email: EmailOutcome }>> {
  if (!ALLOWED_TARGETS.includes(target) || !/^[0-9a-f-]{36}$/i.test(registrationId)) return fail("validation");

  const profile = await getCurrentProfile();
  if (!profile) return fail("unauthenticated");
  if (profile.role === "user") return fail("forbidden");

  const supabase = await createSupabaseServerClient();
  const { data: reg } = await supabase
    .from("registrations")
    .select(
      `id, status, event_id,
       event:events ( id, title, event_date, location, price, organization_id, organization:organizations ( name, slug ) ),
       profile:profiles ( full_name, email )`,
    )
    .eq("id", registrationId)
    .maybeSingle();
  if (!reg || !reg.event) return fail("not_found");
  if (reg.status === target) return ok({ email: "none" });

  const { error } = await supabase.from("registrations").update({ status: target }).eq("id", registrationId);
  if (error) {
    if (error.message === "event_full") return fail("event_full");
    console.error("[setRegistrationStatus]", error.code, error.message);
    return fail("unknown");
  }

  // מייל אישור — רק במעבר להרשמה מאושרת
  let email: EmailOutcome = "none";
  if (target === "approved" && reg.profile?.email) {
    const org = reg.event.organization;
    const lang = "he"; // שפת הנרשם עדיין לא נשמרת — עברית כברירת מחדל
    const { subject, html } = approvalEmail({
      lang,
      fullName: reg.profile.full_name,
      eventTitle: reg.event.title,
      eventDate: reg.event.event_date,
      location: reg.event.location,
      orgName: org?.name ?? "Vibeo",
      price: Number(reg.event.price),
      eventUrl: `${siteUrl()}${localizedPath(lang, `/${org?.slug ?? ""}/events/${reg.event.id}`)}`,
    });
    const result = await sendEmail({ to: reg.profile.email, subject, html });
    email = result.status;

    if (result.status === "sent") {
      await supabase.from("notification_logs").insert({
        event_id: reg.event.id,
        registration_id: reg.id,
        channel: "email",
        notification_type: "approval",
      });
    } else if (result.status === "failed") {
      console.error("[setRegistrationStatus] approval email failed:", result.error);
    }
  }

  // מונה המקומות בעמודים הציבוריים משתנה כשמבטלים/מחזירים הרשמה
  updateTag(eventTag(reg.event.id));
  updateTag(orgEventsTag(reg.event.organization_id));
  refresh();

  return ok({ email });
}
