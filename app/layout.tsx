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
  title: "Аренда катера без капитана в Санкт-Петербурге",
  description:
    "Аренда катера без капитана в Санкт-Петербурге. Самостоятельные прогулки по Неве, каналам и Финскому заливу. Управляйте катером сами после инструктажа.",
  keywords: [
    "аренда катера без капитана спб",
    "катер без капитана санкт-петербург",
    "арендовать катер самому",
    "прогулка на катере нева",
    "катер финский залив",
  ],
  openGraph: {
    title: "Аренда катера без капитана в Санкт-Петербурге",
    description:
      "Самостоятельные прогулки по Неве, каналам и Финскому заливу. Управляйте катером сами после инструктажа.",
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
