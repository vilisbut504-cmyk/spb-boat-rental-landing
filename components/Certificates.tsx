"use client";

import { certificates } from "@/data/content";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";
import { useBooking } from "@/components/BookingProvider";

/** Decorative marine waves — matches the site's stroke icon style */
function WaveMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 10c4-4 8-4 12 0s8 4 12 0 8-4 12 0 8 4 12 0 8-4 8-4" />
      <path d="M4 22c4-4 8-4 12 0s8 4 12 0 8-4 12 0 8 4 12 0 8-4 8-4" opacity="0.45" />
    </svg>
  );
}

export function Certificates() {
  const { scrollToBooking } = useBooking();

  return (
    <section id="certificates" className="bg-milk py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Подарочные сертификаты"
          title="Подарите прогулку по Санкт-Петербургу"
          subtitle="Подарочный сертификат на самостоятельную прогулку на катере — впечатление, которое запомнится надолго."
          center
        />

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <article
              key={cert.amount}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-marine-700 via-marine-600 to-sea-500 p-7 text-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:p-8"
            >
              {/* subtle decorative ring */}
              <span
                className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full border border-white/15"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full border border-white/10"
                aria-hidden="true"
              />

              <WaveMark className="h-8 w-16 text-white/70" />

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Подарочный сертификат
              </p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-[2.6rem]">
                {cert.label}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                На самостоятельную прогулку на катере по Неве, каналам и
                Финскому заливу.
              </p>

              <button
                type="button"
                onClick={() =>
                  scrollToBooking({
                    certificateAmount: String(cert.amount),
                  })
                }
                className="mt-7 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-marine-700 transition-colors hover:bg-marine-50"
                aria-label={`Выбрать подарочный сертификат на ${cert.label}`}
              >
                Выбрать сертификат
              </button>
            </article>
          ))}
        </RevealGroup>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-ink-soft">
          Выберите номинал — форма заявки откроется с уже выбранным форматом
          «Подарочный сертификат». Детали оформления подтвердит менеджер.
        </p>
      </div>
    </section>
  );
}
