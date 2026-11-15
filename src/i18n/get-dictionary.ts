// טעינת מילון לפי שפה — רק בצד השרת
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/he";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  he: () => import("./dictionaries/he").then((m) => m.he),
  en: () => import("./dictionaries/en").then((m) => m.en),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

export type { Dictionary };
