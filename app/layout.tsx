import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Аренда катеров в Санкт-Петербурге — прогулки по Неве",
  description:
    "Аренда катеров с капитаном в Санкт-Петербурге. Прогулки по Неве и каналам, развод мостов, индивидуальные маршруты. Бронирование за 5 минут.",
  keywords: [
    "аренда катера спб",
    "прогулка на катере санкт-петербург",
    "катер с капитаном",
    "развод мостов",
    "прогулки по неве",
  ],
  openGraph: {
    title: "Аренда катеров в Санкт-Петербурге",
    description:
      "Прогулки по Неве и каналам на комфортных катерах с капитаном. Индивидуальные маршруты и развод мостов.",
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
