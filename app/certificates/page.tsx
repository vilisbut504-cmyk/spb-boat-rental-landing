import type { Metadata } from "next";
import { CertificatesContent } from "@/components/CertificatesContent";

const title =
  "Подарочный сертификат на прогулку на катере в Санкт-Петербурге";
const description =
  "Подарочные сертификаты на самостоятельную прогулку на катере в Санкт-Петербурге. Сертификаты на 1, 1,5, 2 или 3 часа.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/certificates",
  },
  openGraph: {
    title,
    description,
    url: "/certificates",
    siteName: "Катер без капитана",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/images/hero/hero-fleet-lakhta.webp",
        width: 1672,
        height: 941,
        alt: "Катера без капитана на Финском заливе у Лахта Центра",
      },
    ],
  },
};

export default function CertificatesPage() {
  return (
    <div className="bg-background pt-[72px]">
      <section className="bg-gradient-to-br from-marine-700 via-marine-600 to-sea-500 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            Подарочные сертификаты
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            Подарочные сертификаты на прогулку на катере
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
            Подарите самостоятельную прогулку по Санкт-Петербургу на одном из
            наших катеров.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Выберите продолжительность прогулки и подходящую категорию дней.
            Дату, время, катер и маршрут получатель сертификата сможет
            согласовать с менеджером отдельно.
          </p>
        </div>
      </section>

      <CertificatesContent />
    </div>
  );
}
