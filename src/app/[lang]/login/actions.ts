"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { hasLocale, localizedPath } from "@/i18n/config";

// כניסה למשתמשים קיימים בלבד (מנהלים) — קוד חד-פעמי במייל, בלי יצירת משתמש חדש

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function sendLoginCode(rawEmail: string): Promise<ActionResult<null>> {
  const email = (rawEmail ?? "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return fail("validation");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) {
    if (error.status === 429 || /rate limit/i.test(error.message)) return fail("rate_limited");
    if (/signups not allowed|user not found/i.test(error.message)) return fail("not_found");
    console.error("[sendLoginCode]", error.status, error.message);
    return fail("email_failed");
  }
  return ok(null);
}

export async function verifyLoginCode(rawEmail: string, rawToken: string, lang: string): Promise<ActionResult<null>> {
  const email = (rawEmail ?? "").trim().toLowerCase();
  const token = (rawToken ?? "").replace(/\s/g, "");
  if (!EMAIL_PATTERN.test(email) || !/^\d{6,10}$/.test(token)) return fail("invalid_code");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return fail(error.status === 429 ? "rate_limited" : "invalid_code");

  redirect(localizedPath(hasLocale(lang) ? lang : "he", "/admin"));
}

export async function signOut(lang: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(localizedPath(hasLocale(lang) ? lang : "he", "/login"));
}
