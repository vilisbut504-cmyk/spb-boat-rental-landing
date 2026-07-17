import Link from "next/link";

/** Gift ribbon over a wave — matches the site's stroke icon style */
function GiftMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="14" y="24" width="36" height="12" rx="2" />
      <path d="M18 36v14a2 2 0 002 2h24a2 2 0 002-2V36" />
      <path d="M32 24v28" />
      <path d="M32 24c-6 0-10-3-10-7 0-2.8 2.2-4 4.4-4 3.6 0 5.6 4.4 5.6 11z" />
      <path d="M32 24c6 0 10-3 10-7 0-2.8-2.2-4-4.4-4-3.6 0-5.6 4.4-5.6 11z" />
      <path d="M6 60c2.5-2 5-2 7.5 0s5 2 7.5 0 5-2 7.5 0 5 2 7.5 0 5-2 7.5 0 5 2 7.5 0 5-2 7.5 0" opacity="0.5" strokeWidth="2" />
    </svg>
  );
}

/**
 * Compact promo block on the home page. The full certificate system
 * (tariffs + form) lives on /certificates.
 */
export function Certificates() {
  return (
    <section id="certificates" className="bg-milk py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-marine-700 via-marine-600 to-sea-500 px-6 py-10 text-white sm:px-10 sm:py-12">
          <span
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/15"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-full border border-white/10"
            aria-hidden="true"
          />

          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col items-start gap-6 sm:flex-row sm:items-center">
              <span className="flex h-20 w-20 flex-none items-center justify-center rounded-2xl bg-white/10 text-white/90">
                <GiftMark className="h-12 w-12" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Подарок близким
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Подарочные сертификаты
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                  Подарите самостоятельную прогулку на катере по
                  Санкт-Петербургу — выберите продолжительность и оставьте
                  заявку на оформление сертификата.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/60 sm:text-sm">
                  Сертификаты доступны на прогулки продолжительностью от 1 до
                  3 часов.
                </p>
              </div>
            </div>

            <Link
              href="/certificates"
              className="w-full flex-none rounded-full bg-white px-8 py-3.5 text-center text-sm font-semibold text-marine-700 transition-colors hover:bg-marine-50 sm:w-auto"
            >
              Выбрать сертификат
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
