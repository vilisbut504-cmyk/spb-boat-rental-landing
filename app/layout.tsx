import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { brandAssets } from "@/data/content";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const title = "Питер Катер — аренда катера без капитана в Санкт-Петербурге";
const description =
  "Самостоятельные прогулки на катере по Неве, каналам и Финскому заливу. Управляйте катером сами без прав, легально и после инструктажа.";

export const metadata: Metadata = {
  title,
  description,
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
    "питер катер",
  ],
  openGraph: {
    title,
    description,
    locale: "ru_RU",
    type: "website",
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
        </Providers>
      </body>
    </html>
  );
}
