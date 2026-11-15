import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/**
 * מחזיר את המשתמש המחובר ואת הפרופיל שלו, או null לאורח.
 * דינמי (קורא עוגיות) — להשתמש רק בתוך <Suspense>, ב-Server Actions או ב-Route Handlers.
 */
export async function getCurrentProfile(): Promise<Tables<"profiles"> | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}
