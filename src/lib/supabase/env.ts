// משתני הסביבה הציבוריים של Supabase (בטוחים לחשיפה בדפדפן — מוגנים ע״י RLS)

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "חסרים משתני סביבה: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ראו .env.example)",
    );
  }
  return { url, key };
}
