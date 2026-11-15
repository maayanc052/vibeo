// מבנה תשובה אחיד לכל ה-Server Actions — הצלחה עם נתונים, או מפתח שגיאה לתרגום במילון

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: ActionErrorCode; message?: string };

/** קודי שגיאה קבועים — הטקסט המוצג למשתמש מגיע מהמילון (he/en) */
export type ActionErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "validation"
  | "already_registered"
  | "event_full"
  | "unknown";

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: ActionErrorCode, message?: string): ActionResult<never> => ({
  ok: false,
  error,
  message,
});
