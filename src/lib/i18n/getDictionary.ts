import type { Locale } from "./config";
import type { Dictionary } from "@/types/dictionary";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  id: () => import("./dictionaries/id.json").then((module) => module.default as Dictionary),
  en: () => import("./dictionaries/en.json").then((module) => module.default as Dictionary),
};

export type { Dictionary } from "@/types/dictionary";

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
