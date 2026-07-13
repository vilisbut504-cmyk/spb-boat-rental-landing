import Image from "next/image";
import { site } from "@/data/site";
import { SectionHeading } from "@/components/SectionHeading";
import {
  MapPinIcon,
  PhoneIcon,
  TelegramIcon,
  VkIcon,
} from "@/components/SocialIcons";

export function ContactStart() {
  return (
    <section id="contacts" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Связь"
          title="Точка старта и связь"
          center
        />
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-ink-soft sm:text-base">
          Старт прогулок — {site.address}. Ориентир — {site.landmark.toLowerCase()}.
          Точное время выхода и маршрут подтверждает менеджер после заявки.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={site.phoneHref}
              aria-label={site.phoneAriaLabel}
              className="group flex flex-col rounded-2xl border border-marine-100 bg-milk p-5 transition-colors hover:border-marine-300"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-marine-50 text-marine-600 transition-colors group-hover:bg-marine-600 group-hover:text-white">
                <PhoneIcon className="h-5 w-5" />
              </span>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Телефон
              </span>
              <span className="mt-1 text-lg font-semibold text-ink">
                {site.phoneDisplay}
              </span>
            </a>

            <a
              href={site.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={site.telegramAriaLabel}
              className="group flex flex-col rounded-2xl border border-marine-100 bg-milk p-5 transition-colors hover:border-marine-300"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-marine-50 text-marine-600 transition-colors group-hover:bg-marine-600 group-hover:text-white">
                <TelegramIcon className="h-5 w-5" />
              </span>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Telegram
              </span>
              <span className="mt-1 text-lg font-semibold text-ink">
                {site.telegramUsername}
              </span>
            </a>

            <a
              href={site.vkUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={site.vkAriaLabel}
              className="group flex flex-col rounded-2xl border border-marine-100 bg-milk p-5 transition-colors hover:border-marine-300"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-marine-50 text-marine-600 transition-colors group-hover:bg-marine-600 group-hover:text-white">
                <VkIcon className="h-5 w-5" />
              </span>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Мы ВКонтакте
              </span>
              <span className="mt-1 text-base font-semibold leading-snug text-ink">
                {site.vkLabel}
              </span>
              <span className="mt-2 text-xs leading-relaxed text-ink-soft">
                Новости, свободные даты и фотографии прогулок
              </span>
            </a>

            <div className="flex flex-col rounded-2xl border border-marine-100 bg-milk p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-marine-50 text-marine-600">
                <MapPinIcon className="h-5 w-5" />
              </span>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Адрес и ориентир
              </span>
              <span className="mt-1 text-base font-semibold leading-snug text-ink">
                {site.addressShort}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-ink-soft">
                {site.landmark}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center rounded-2xl border border-marine-100 bg-milk p-6 text-center sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Telegram
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
              Отсканируйте QR-код или откройте Telegram по кнопке
            </p>
            <p className="mt-1 font-semibold text-marine-700">
              {site.telegramUsername}
            </p>

            <a
              href={site.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={site.telegramAriaLabel}
              className="mt-5 block rounded-2xl bg-white p-3 ring-1 ring-marine-100 transition-shadow hover:shadow-md"
            >
              <Image
                src={site.telegramQr}
                alt="QR-код Telegram проекта «Катер без капитана»"
                width={800}
                height={800}
                className="h-[180px] w-[180px] sm:h-[220px] sm:w-[220px]"
                sizes="220px"
                unoptimized
              />
            </a>

            <a
              href={site.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={site.telegramAriaLabel}
              className="mt-6 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-marine-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-marine-700"
            >
              <TelegramIcon className="h-4 w-4" />
              Открыть Telegram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
