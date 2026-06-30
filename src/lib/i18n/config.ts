export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "id";

export const localeNames: Record<Locale, string> = {
  id: "Indonesia",
  en: "English",
};

export const localeFlags: Record<Locale, string> = {
  id: "🇮🇩",
  en: "🇬🇧",
};

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const routeAliases: Record<string, Record<Locale, string>> = {
  "/about": { id: "/tentang-kami", en: "/about" },
  "/services": { id: "/layanan", en: "/services" },
  "/experience": { id: "/pengalaman", en: "/experience" },
  "/news": { id: "/berita", en: "/news" },
  "/gallery": { id: "/galeri", en: "/gallery" },
  "/contact": { id: "/kontak", en: "/contact" },
};

export function getLocalizedUrl(path: string, locale: Locale): string {
  for (const [base, aliases] of Object.entries(routeAliases)) {
    if (path === base || path.startsWith(`${base}/`)) {
      const alias = aliases[locale];
      return `/${locale}${path.replace(base, alias)}`;
    }
  }
  return `/${locale}${path}`;
}
