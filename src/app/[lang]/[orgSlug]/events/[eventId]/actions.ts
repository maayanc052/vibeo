"use server";

import { updateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { eventTag, orgEventsTag } from "@/lib/data/organizations";
import { parseFormFields, validateAnswers } from "@/lib/forms/schema";
import { fail, ok, type ActionResult } from "@/lib/actions/result";

// ---------------------------------------------------------------------------
// הרשמה לאירוע בשני שלבים:
//   1. startRegistration — בדיקות בסיס ושליחת קוד אימות למייל (Supabase Auth OTP)
//   2. completeRegistration — אימות הקוד, בדיקת תשובות הטופס ושמירת ההרשמה
// ההרשמה נכנסת בסטטוס pending_approval (ברירת המחדל במסד).
// RLS + טריגר התפוסה + UNIQUE(event_id, user_id) הם קו ההגנה האחרון.
// ---------------------------------------------------------------------------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const OTP_PATTERN = /^\d{6,10}$/;

type StartInput = { eventId: string; email: string; fullName: string };
type CompleteInput = StartInput & { token?: string; answers: unknown };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** טוען את האירוע מהמסד (טרי, לא מהמטמון) ובודק שהוא פעיל ושיש מקום */
async function loadOpenEvent(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, eventId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) return { error: "not_found" as const };
  const { data: event } = await supabase
    .from("events")
    .select("id, organization_id, is_active, max_capacity, seats_taken, custom_form_fields, event_date")
    .eq("id", eventId)
    .maybeSingle();
  if (!event || !event.is_active) return { error: "not_found" as const };
  if (event.seats_taken >= event.max_capacity) return { error: "event_full" as const };
  return { event };
}

export async function startRegistration(input: StartInput): Promise<ActionResult<{ otpSent: boolean }>> {
  const email = normalizeEmail(input.email ?? "");
  const fullName = (input.fullName ?? "").trim();
  if (!EMAIL_PATTERN.test(email) || fullName.length < 2 || fullName.length > 120) {
    return fail("validation");
  }

  const supabase = await createSupabaseServerClient();
  const loaded = await loadOpenEvent(supabase, input.eventId);
  if ("error" in loaded) return fail(loaded.error!);

  // משתמש שכבר מחובר עם אותו מייל — אין צורך בקוד נוסף
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email && normalizeEmail(user.email) === email) {
    return ok({ otpSent: false });
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, data: { full_name: fullName } },
  });
  if (error) {
    if (error.status === 429 || /rate limit/i.test(error.message)) return fail("rate_limited");
    console.error("[startRegistration] signInWithOtp failed:", error.message);
    return fail("email_failed");
  }
  return ok({ otpSent: true });
}

export async function completeRegistration(input: CompleteInput): Promise<ActionResult<{ status: string }>> {
  const email = normalizeEmail(input.email ?? "");
  const fullName = (input.fullName ?? "").trim();
  if (!EMAIL_PATTERN.test(email) || fullName.length < 2 || fullName.length > 120) {
    return fail("validation");
  }

  const supabase = await createSupabaseServerClient();

  // 1) אימות הקוד (אם נשלח) — יוצר חיבור ושומר אותו בעוגיות
  if (input.token) {
    const token = input.token.replace(/\s/g, "");
    if (!OTP_PATTERN.test(token)) return fail("invalid_code");
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) return fail(error.status === 429 ? "rate_limited" : "invalid_code");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("unauthenticated");
  if (!user.email || normalizeEmail(user.email) !== email) return fail("forbidden");

  // 2) האירוע ובדיקת תשובות הטופס הדינמי
  const loaded = await loadOpenEvent(supabase, input.eventId);
  if ("error" in loaded) return fail(loaded.error!);
  const { event } = loaded;

  const validation = validateAnswers(parseFormFields(event.custom_form_fields), input.answers);
  if (!validation.ok) return fail("validation", JSON.stringify(validation.errors));

  // 3) עדכון השם בפרופיל (העמודה היחידה שמשתמש רשאי לעדכן)
  await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);

  // 4) שמירת ההרשמה
  const { error } = await supabase.from("registrations").insert({
    event_id: event.id,
    user_id: user.id,
    custom_answers: validation.answers,
  });
  if (error) {
    if (error.code === "23505") return fail("already_registered");
    if (error.message === "event_full") return fail("event_full");
    console.error("[completeRegistration] insert failed:", error.code, error.message);
    return fail("unknown");
  }

  // רענון מיידי של מונה המקומות בעמודים
  updateTag(eventTag(event.id));
  updateTag(orgEventsTag(event.organization_id));

  return ok({ status: "pending_approval" });
}
