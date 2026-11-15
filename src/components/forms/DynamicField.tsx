"use client";

import type { Locale } from "@/i18n/config";
import { labelFor, optionsFor, type FormField } from "@/lib/forms/schema";

type Props = {
  field: FormField;
  lang: Locale;
  value: string | boolean | undefined;
  error?: string;
  onChange: (value: string | boolean) => void;
  t: { optional: string; choose: string; yes: string };
  disabled?: boolean;
};

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand)]/30 disabled:opacity-60";

/** שדה אחד בטופס הדינמי — מוצג לפי סוג השדה שהוגדר לאירוע */
export function DynamicField({ field, lang, value, error, onChange, t, disabled }: Props) {
  const id = `field-${field.id}`;
  const label = labelFor(field.label, lang);
  const errorId = error ? `${id}-error` : undefined;

  if (field.type === "checkbox") {
    return (
      <div>
        <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            aria-describedby={errorId}
            className="size-5 accent-[color:var(--brand)]"
          />
          <span>
            {label} {!field.required && <span className="text-sm text-muted">{t.optional}</span>}
          </span>
        </label>
        {error && <p id={errorId} className="mt-1 text-sm text-pink-300">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-white/85">
        {label} {field.required ? <span className="text-pink-300">*</span> : <span className="text-muted">{t.optional}</span>}
      </label>

      {field.type === "text" && (
        <input
          id={id}
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          maxLength={300}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={inputClass}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          id={id}
          rows={3}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          maxLength={2000}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={inputClass}
        />
      )}

      {(field.type === "select" || field.type === "dietary") && (
        <select
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`${inputClass} appearance-none`}
        >
          <option value="" className="bg-[#120f1f]">
            {t.choose}
          </option>
          {optionsFor(field).map((o) => (
            <option key={o.value} value={o.value} className="bg-[#120f1f]">
              {labelFor(o.label, lang)}
            </option>
          ))}
        </select>
      )}

      {error && <p id={errorId} className="mt-1 text-sm text-pink-300">{error}</p>}
    </div>
  );
}
