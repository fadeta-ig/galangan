import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, routeAliases, type Locale } from "@/lib/i18n/config";
import { getToken } from "next-auth/jwt";

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (locales.includes(maybeLocale as typeof locales[number])) {
    return maybeLocale;
  }
  return null;
}

function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.trim();
    if (preferred && locales.includes(preferred as typeof locales[number])) {
      return preferred;
    }
  }
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes, but allow /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = await getToken({ req: request });

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(loginUrl);
    }
  }

  // Skip internal paths, API routes, static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameLocale = getLocaleFromPath(pathname);
  if (pathnameLocale) {
    // Reverse lookup for route aliases
    const pathWithoutLocale = pathname.replace(`/${pathnameLocale}`, "");
    let physicalPath = pathWithoutLocale;
    
    for (const [base, aliases] of Object.entries(routeAliases)) {
      const alias = aliases[pathnameLocale as Locale];
      if (alias && (pathWithoutLocale === alias || pathWithoutLocale.startsWith(`${alias}/`))) {
        physicalPath = pathWithoutLocale.replace(alias, base);
        break;
      }
    }
    
    if (physicalPath !== pathWithoutLocale) {
      return NextResponse.rewrite(new URL(`/${pathnameLocale}${physicalPath}`, request.url));
    }

    return NextResponse.next();
  }

  // Redirect to default locale
  const locale = getPreferredLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Match all paths except static files and API
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
