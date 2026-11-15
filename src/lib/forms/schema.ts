// ---------------------------------------------------------------------------
// טופס הרשמה דינמי — הגדרות השדות נשמרות ב-events.custom_form_fields (JSONB)
// והתשובות ב-registrations.custom_answers (JSONB).
// הקובץ משותף לשרת ולדפדפן (ללא תלויות שרת).
// ---------------------------------------------------------------------------
import type { Locale } from "@/i18n/config";

export const FIELD_TYPES = ["text", "textarea", "select", "checkbox", "dietary"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

/** תווית מתורגמת: {"he": "...", "en": "..."} או מחרוזת אחת לכל השפות */
export type FieldLabel = string | Partial<Record<Locale, string>>;

export type FormFieldOption = { value: string; label: FieldLabel };

export type FormField = {
  id: string;
  type: FieldType;
  label: FieldLabel;
  required: boolean;
  options?: FormFieldOption[];
};

export type FormAnswers = Record<string, string | boolean>;

/** אפשרויות קבועות לשדה "העדפה תזונתית" */
export const DIETARY_OPTIONS: FormFieldOption[] = [
  { value: "regular", label: { he: "רגיל", en: "No restrictions" } },
  { value: "vegetarian", label: { he: "צמחוני", en: "Vegetarian" } },
  { value: "vegan", label: { he: "טבעוני", en: "Vegan" } },
  { value: "gluten_free", label: { he: "ללא גלוטן", en: "Gluten-free" } },
  { value: "kosher_mehadrin", label: { he: "כשר למהדרין", en: "Kosher mehadrin" } },
  { value: "other", label: { he: "אחר (נא לפרט בהערות)", en: "Other (please specify)" } },
];

const MAX_TEXT = 300;
const MAX_TEXTAREA = 2000;
const ID_PATTERN = /^[a-z0-9_-]{1,40}$/i;

export function labelFor(label: FieldLabel, lang: Locale): string {
  if (typeof label === "string") return label;
  return label[lang] ?? label.he ?? label.en ?? "";
}

/** אפשרויות הבחירה של שדה (לשדה תזונתי — הרשימה הקבועה) */
export function optionsFor(field: FormField): FormFieldOption[] {
  return field.type === "dietary" ? DIETARY_OPTIONS : (field.options ?? []);
}

function isLabel(v: unknown): v is FieldLabel {
  if (typeof v === "string") return v.trim().length > 0;
  return !!v && typeof v === "object" && !Array.isArray(v) && Object.values(v).some((x) => typeof x === "string" && x.trim());
}

/** ממיר JSON מהמסד לרשימת שדות תקינה — שדות פגומים מושמטים בשקט */
export function parseFormFields(json: unknown): FormField[] {
  if (!Array.isArray(json)) return [];
  const seen = new Set<string>();
  const fields: FormField[] = [];

  for (const raw of json) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== "string" || !ID_PATTERN.test(r.id) || seen.has(r.id)) continue;
    if (typeof r.type !== "string" || !(FIELD_TYPES as readonly string[]).includes(r.type)) continue;
    if (!isLabel(r.label)) continue;

    const field: FormField = {
      id: r.id,
      type: r.type as FieldType,
      label: r.label,
      required: r.required === true,
    };

    if (field.type === "select") {
      const options = Array.isArray(r.options)
        ? r.options.filter(
            (o): o is FormFieldOption =>
              !!o && typeof o === "object" && typeof (o as FormFieldOption).value === "string" && isLabel((o as FormFieldOption).label),
          )
        : [];
      if (options.length === 0) continue;
      field.options = options;
    }

    seen.add(field.id);
    fields.push(field);
  }
  return fields;
}

export type ValidationResult =
  | { ok: true; answers: FormAnswers }
  | { ok: false; errors: Record<string, "required" | "invalid" | "too_long"> };

/** בדיקת התשובות מול הגדרות השדות — רץ בשרת לפני שמירה (לא סומכים על הדפדפן) */
export function validateAnswers(fields: FormField[], input: unknown): ValidationResult {
  const source = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const answers: FormAnswers = {};
  const errors: Record<string, "required" | "invalid" | "too_long"> = {};

  for (const field of fields) {
    const value = source[field.id];

    if (field.type === "checkbox") {
      const checked = value === true || value === "true" || value === "on";
      if (field.required && !checked) errors[field.id] = "required";
      answers[field.id] = checked;
      continue;
    }

    const text = typeof value === "string" ? value.trim() : "";
    if (!text) {
      if (field.required) errors[field.id] = "required";
      continue;
    }

    if (field.type === "select" || field.type === "dietary") {
      if (!optionsFor(field).some((o) => o.value === text)) errors[field.id] = "invalid";
      else answers[field.id] = text;
      continue;
    }

    const max = field.type === "textarea" ? MAX_TEXTAREA : MAX_TEXT;
    if (text.length > max) errors[field.id] = "too_long";
    else answers[field.id] = text;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, answers };
}
