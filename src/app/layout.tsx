import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let favicon = "/favicon.ico";
  try {
    const faviconSetting = await prisma.siteSetting.findUnique({ where: { key: "site_favicon" } });
    if (faviconSetting?.value) {
      favicon = faviconSetting.value;
    }
  } catch {
    // Ignore db errors if not ready
  }

  return {
    title: {
      default: "Galangan Kapal",
      template: "%s | Galangan Kapal",
    },
    description: "Trusted shipyard for ship repair, shipbuilding, and docking solutions.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    icons: {
      icon: favicon,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geist.variable} ${outfit.variable} ${plusJakarta.variable}`}>
        {children}
      </body>
    </html>
  );
}
