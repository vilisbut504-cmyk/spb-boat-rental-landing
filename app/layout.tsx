import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { FloatingCallButton } from "@/components/FloatingCallButton";
import { brandAssets } from "@/data/content";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const title =
  "Катер без капитана — аренда катера без прав в Санкт-Петербурге";
const description =
  "Самостоятельные прогулки по Неве, островам и Финскому заливу. Семь катеров, бесплатный инструктаж, управление без прав ГИМС и бронь 1 000 ₽ в счёт прогулки.";

const ogTitle =
  "Катер без капитана — самостоятельные прогулки по Санкт-Петербургу";
const ogDescription =
  "Семь катеров, маршруты по Неве и Финскому заливу, бесплатный инструктаж и управление без прав ГИМС.";

const siteUrl = "https://spb-boat-rental-landing.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: brandAssets.favicon,
    apple: brandAssets.favicon,
  },
  keywords: [
    "аренда катера без капитана спб",
    "катер без капитана санкт-петербург",
    "арендовать катер самому",
    "прогулка на катере нева",
    "катер финский залив",
    "катер без капитана",
  ],
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    url: siteUrl,
    siteName: "Катер без капитана",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/images/hero/hero-fleet-lakhta.webp",
        width: 1672,
        height: 941,
        alt: "Четыре катера без капитана на Финском заливе у Лахта Центра",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
    images: ["/images/hero/hero-fleet-lakhta.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingCallButton />
        </Providers>
      </body>
    </html>
  );
}
