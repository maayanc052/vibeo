import "server-only";
import { localeDir, localeTag, type Locale } from "@/i18n/config";
import { escapeHtml } from "./send";

// תבניות מייל דו-לשוניות. הטקסטים כאן ולא במילון, כי המייל נשלח בשפת הנרשם
// ונבנה כ-HTML מלא (עם עיצוב inline שעובד בכל תוכנות הדואר).

type ApprovalEmailInput = {
  lang: Locale;
  fullName: string | null;
  eventTitle: string;
  eventDate: string;
  location: string | null;
  orgName: string;
  price: number;
  eventUrl: string;
};

const copy = {
  he: {
    subject: (title: string) => `ההרשמה שלך ל"${title}" אושרה`,
    hello: (name: string) => `שלום ${name},`,
    helloAnon: "שלום,",
    approved: "שמחים לבשר — ההרשמה שלך אושרה!",
    when: "מתי",
    where: "איפה",
    paid: "בקרוב יישלח אליך קישור לתשלום להשלמת ההרשמה.",
    free: "בקרוב יישלח אליך כרטיס דיגיטלי עם קוד QR לכניסה.",
    cta: "לפרטי האירוע",
    footer: (org: string) => `נשלח מטעם ${org} באמצעות Vibeo`,
  },
  en: {
    subject: (title: string) => `Your registration for "${title}" is approved`,
    hello: (name: string) => `Hi ${name},`,
    helloAnon: "Hi,",
    approved: "Great news — your registration has been approved!",
    when: "When",
    where: "Where",
    paid: "You'll soon receive a payment link to complete your registration.",
    free: "You'll soon receive a digital ticket with a QR code for entry.",
    cta: "Event details",
    footer: (org: string) => `Sent on behalf of ${org} via Vibeo`,
  },
} as const;

export function approvalEmail(input: ApprovalEmailInput): { subject: string; html: string } {
  const c = copy[input.lang];
  const dir = localeDir[input.lang];
  const date = new Intl.DateTimeFormat(localeTag[input.lang], {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jerusalem",
  }).format(new Date(input.eventDate));

  const title = escapeHtml(input.eventTitle);
  const greeting = input.fullName ? c.hello(escapeHtml(input.fullName)) : c.helloAnon;

  const html = `<!doctype html>
<html lang="${input.lang}" dir="${dir}">
<body style="margin:0;background:#f4f2ff;font-family:Arial,Helvetica,sans-serif;color:#1a1530">
  <div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden" dir="${dir}">
    <div style="background:linear-gradient(90deg,#8b5cf6,#22d3ee);padding:20px 24px;color:#ffffff;font-size:22px;font-weight:bold">Vibeo</div>
    <div style="padding:24px">
      <p style="margin:0 0 8px">${greeting}</p>
      <p style="margin:0 0 20px;font-size:18px;font-weight:bold">${c.approved}</p>
      <div style="background:#f4f2ff;border-radius:12px;padding:16px">
        <p style="margin:0 0 8px;font-size:18px;font-weight:bold">${title}</p>
        <p style="margin:0 0 4px"><strong>${c.when}:</strong> ${escapeHtml(date)}</p>
        ${input.location ? `<p style="margin:0"><strong>${c.where}:</strong> ${escapeHtml(input.location)}</p>` : ""}
      </div>
      <p style="margin:20px 0">${input.price > 0 ? c.paid : c.free}</p>
      <a href="${escapeHtml(input.eventUrl)}" style="display:inline-block;background:#8b5cf6;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold">${c.cta}</a>
    </div>
    <div style="padding:16px 24px;font-size:12px;color:#6b6585;border-top:1px solid #eee">${escapeHtml(c.footer(input.orgName))}</div>
  </div>
</body>
</html>`;

  return { subject: c.subject(input.eventTitle), html };
}
