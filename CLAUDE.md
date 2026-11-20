# Project Specification: Vibeo (וַיְבֶאוֹ)
## Multi-Tenant Event, Team-Building & Community SaaS Platform

### 1. Core Architecture & Tech Stack
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security - RLS for strict multi-tenant isolation).
- **Email & Notifications:** Resend API (for OTP verification, admin approval alerts, RSVP links, and automated reminders).
- **Payments:** Modular Israeli payment gateway adapter (supporting PayPlus / Grow / Meshulam APIs + built-in Mock Mode for local testing).
- **Language & Direction:** Hebrew-first interface (`dir="rtl"`), full RTL layout adaptation.

### 2. Core Features & Modules
- **A. Landing Page & 2027 Cinematic UI:**
  - Full-width looping royalty-free background video with dark glassmorphism overlay (`backdrop-blur-xl`), floating navigation bar with the custom `VibeoLogo` SVG component, and clear Hebrew CTAs.
  - Asymmetric Bento Grid 2.0 below the hero showcasing event categories, team-building packages, and live upcoming workshops with smooth hover border illuminations.
- **B. Multi-Tenancy & Dynamic Form Builder:**
  - Isolated Workspaces per client/company (`/[orgSlug]`) with custom logo and brand colors.
  - Dynamic Form Builder: Admins add unlimited custom registration fields per event (Dropdowns, Text, Checkboxes, Dietary preferences), stored as JSONB in `events.custom_form_fields` and `registrations.custom_answers`.
- **C. Zero-Friction OTP Security & Admin Approval:**
  - Deduplication enforced via PostgreSQL `UNIQUE(event_id, user_id)` and 6-digit Email OTP verification before locking a spot.
  - Registrations enter as `pending_approval`. Admins approve/reject via dashboard; approval triggers an automated email with a payment link (if paid) or direct digital ticket (if free).
- **D. RSVP System, Digital QR Pass & Automated Reminders:**
  - 1-Click RSVP Page (`/rsvp/[token]`): Users confirm (`confirmed_attending`) or decline (`declined`) without logging in.
  - Digital Ticket & Mobile Check-In: Confirmed users receive a personal QR code pass; admins scan via `/admin/checkin` to update `rsvp_status` to `checked_in`.
  - Automated Reminders Engine (`/api/cron/reminders` via `vercel.json`): Dispatches 24h and 2h reminders via Resend email + 1-click WhatsApp share links, logging to `notification_logs`.
- **E. Ideation Hub & AI Concept Generator Agent:**
  - Community Wishlist (`event_ideas` & `idea_votes`): Users propose new event ideas and upvote suggestions.
  - AI Demo Generator (`/api/ai/generate-event`): Admins input a short prompt, and the AI agent generates a complete event draft (title, marketing copy, schedule, suggested pricing, and custom form schema) ready to publish in one click.

### 3. Database Schema (Supabase PostgreSQL)
- `organizations`: `id`, `name`, `slug`, `logo_url`, `brand_colors` (JSONB), `created_at`
- `profiles`: `id`, `email`, `full_name`, `organization_id`, `role` (`super_admin`, `org_admin`, `user`), `created_at`
- `events`: `id`, `organization_id`, `title`, `description`, `category`, `event_date`, `max_capacity`, `price`, `cover_image_url`, `is_active`, `custom_form_fields` (JSONB), `created_at`
- `registrations`: `id`, `event_id`, `user_id`, `status` (`pending_approval`, `approved`, `paid`, `cancelled`), `rsvp_status` (`awaiting_rsvp`, `confirmed_attending`, `declined`, `checked_in`), `rsvp_token` (UUID), `qr_code_hash`, `reminder_24h_sent`, `reminder_2h_sent`, `checked_in_at`, `custom_answers` (JSONB), `created_at`, `UNIQUE(event_id, user_id)`
- `payments`: `id`, `registration_id`, `amount`, `gateway_transaction_id`, `status`, `created_at`
- `event_ideas` & `idea_votes`: community wishlist and upvote tracking
- `notification_logs`: `id`, `event_id`, `registration_id`, `channel`, `notification_type`, `sent_at`

### 4. Strict Copyright & Royalty-Free Assets Policy
- **Fonts:** Exclusively Google Fonts supporting Hebrew (`Heebo`, `Assistant`, `Rubik`).
- **Icons:** Exclusively `lucide-react`.
- **Logo:** Inline SVG `VibeoLogo` component.
- **Images & Videos:** Verified royalty-free sources only (**Pexels**, **Unsplash**, **Pixabay** CC0) or CSS/Canvas procedural gradients.
- **Audio:** CC0 royalty-free sounds only or Web Audio API synthesis.

### 5. Execution Plan
1. Scaffold Next.js App Router with RTL, Google Fonts (`Heebo`), Tailwind dark-mode theme, `.env.example`, and `VibeoLogo`.
2. Build the 2027 Cinematic Landing Page (Hero + Bento Grid) and Tenant Event Page (`/[orgSlug]`).
3. Set up Supabase client, server actions, and TypeScript types matching the schema.
4. Implement Email OTP Registration & Dynamic Form rendering.
5. Build Admin Dashboard: Approval queue, Dynamic Form Builder, AI Event Generator (`/api/ai/generate-event`), and RSVP/Reminders tracker.
6. Build 1-Click RSVP page (`/rsvp/[token]`), Digital QR Pass, Mobile Check-In (`/admin/checkin`), and `vercel.json` Cron reminders (`/api/cron/reminders`).

---

### 6. החלטות נוספות (מהמשתמש)
- **שפה:** כל המערכת — כולל מערכת הניהול (Admin) — בעברית כברירת מחדל (`dir="rtl"`), עם אפשרות להחליף לאנגלית (`dir="ltr"`). יש להקים תשתית i18n (מילוני `he` / `en`) ולא לקבע טקסטים בקוד.
- **תקשורת:** כל ההערות בקוד וכל ההסברים למשתמש — בעברית.
- **מבנה i18n (מיושם):** כל הדפים תחת `src/app/[lang]/` (`he` | `en`). `src/proxy.ts` משאיר כתובות עבריות נקיות (`/acme` → rewrite פנימי ל-`/he/acme`), מפנה `/he/...` לכתובת הנקייה, ואנגלית עם קידומת (`/en/acme`). מילונים ב-`src/i18n/dictionaries/` (המילון העברי הוא מקור המבנה; האנגלי נבדק מולו ב-TypeScript). עזרים: `localizedPath`, `stripLocale`, `LanguageSwitcher`, `ForwardArrow` (חץ שמתהפך לפי כיוון). יש להשתמש בתכונות לוגיות (`ms-/me-/start/end`, `rtl:`/`ltr:`) ולא ב-left/right.
- **Next.js 16 עם `cacheComponents`:** לפני כתיבת קוד יש לעיין במדריכים ב-`node_modules/next/dist/docs/` (ממשקים שונים מהמוכר, למשל `proxy` במקום `middleware`).
- **מסד נתונים (מיושם):** פרויקט Supabase `vibeo` (`qtosudiozndahpmsxmcb`, אזור `eu-central-1` — אין אזור בישראל). המיגרציות ב-`supabase/migrations/`. תוספות על הסכמה: `location`, `tagline`, `seats_taken` (מונה שמתעדכן בטריגר), ועמודת `i18n` (JSONB) לתרגומים: `{"en": {"title": "..."}}` — העברית בעמודות הרגילות. פונקציות אבטחה בסכמה `private` (לא חשופה ב-API). אחרי שינוי סכמה יש ליצור מחדש את `src/types/database.ts`.
- **גישה לנתונים:** קריאות ציבוריות דרך `src/lib/data/*` עם `'use cache'` + `cacheTag` (לרענון מיידי: `updateTag`/`revalidateTag` עם `orgTag`/`orgEventsTag`). לקוחות: `public.ts` (ציבורי, ללא עוגיות), `server.ts` (משתמש מחובר), `client.ts` (דפדפן), `admin.ts` (service role — שרת בלבד). Server Actions מחזירים `ActionResult` (`src/lib/actions/result.ts`).
- **Vercel:** פרויקט `vibeo` (`prj_6QwCAg0tv76JIdVl5jKb9uiWy0Hi`, צוות `team_JVOrLVHdMmsyBGV7CTqjasvr`), כתובת ייצור: https://vibeo-lime.vercel.app. משתני `NEXT_PUBLIC_SUPABASE_*` מוגדרים שם.
- **הרשמה (שלב 4, מיושם):** עמוד אירוע `/[orgSlug]/events/[eventId]` עם `RegistrationFlow` (פרטים + טופס דינמי → קוד OTP במייל דרך Supabase Auth → `pending_approval`). Server Actions ב-`events/[eventId]/actions.ts`. הגדרות שדות: `src/lib/forms/schema.ts` (סוגים: text, textarea, select, checkbox, dietary; תוויות `{he, en}`; אימות בשרת עם `validateAnswers`). טריגר `guard_event_capacity` חוסם הרשמה לאירוע מלא (שגיאה `event_full`). ה-proxy מרענן חיבור Supabase רק כשיש עוגיית `sb-*`.
- **לוח ניהול (שלב 5, בתהליך):** `/[lang]/admin` (מוגן — `AdminGate` ב-layout בודק התחברות ותפקיד; אורח מופנה ל-`/login`). כניסה במייל+קוד למשתמשים קיימים בלבד (`login/actions.ts`). תור אישורים עם לשוניות סטטוס; `setRegistrationStatus` מאשר/דוחה ושולח מייל אישור דרך Resend (`src/lib/email/*`; בלי `RESEND_API_KEY` המייל מדולג והאישור עובר). מיגרציה 5: מנהל ארגון רואה פרופילי נרשמים לאירועי הארגון ורושם ב-`notification_logs`.
