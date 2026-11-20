import "server-only";

// ---------------------------------------------------------------------------
// שליחת מיילים דרך Resend (REST API — בלי ספרייה נוספת).
// אם RESEND_API_KEY לא מוגדר, השליחה מדולגת (skipped) — הפעולה שהפעילה אותה
// (למשל אישור הרשמה) ממשיכה כרגיל ולא נכשלת בגלל מייל.
// ---------------------------------------------------------------------------

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult = { status: "sent"; id: string } | { status: "skipped" } | { status: "failed"; error: string };

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { status: "skipped" };

  const from = process.env.RESEND_FROM_EMAIL || "Vibeo <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok || !body.id) {
      return { status: "failed", error: body.message ?? `HTTP ${res.status}` };
    }
    return { status: "sent", id: body.id };
  } catch (err) {
    return { status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}

/** ממיר תווים מיוחדים כדי ששם/כותרת לא ישברו את ה-HTML של המייל */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
