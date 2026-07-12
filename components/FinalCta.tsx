import { site } from "@/data/site";
import { PhoneIcon, TelegramIcon, VkIcon } from "@/components/SocialIcons";

export function FinalCta() {
  return (
    <section className="bg-milk px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-marine-700 via-marine-600 to-sea-500 px-6 py-14 text-center sm:px-12 sm:py-20">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Готовы выйти на воду?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
          Оставьте заявку — подберём катер, время и маршрут для вашей прогулки по
          Петербургу. Или напишите нам в Telegram и позвоните.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <a
            href="#booking"
            className="w-full rounded-full bg-white px-7 py-3.5 font-semibold text-marine-700 transition-colors hover:bg-marine-50 sm:w-auto"
          >
            Забронировать катер
          </a>
          <a
            href={site.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={site.telegramAriaLabel}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            <TelegramIcon className="h-4 w-4" />
            Написать в Telegram
          </a>
          <a
            href={site.phoneHref}
            aria-label={site.phoneAriaLabel}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            <PhoneIcon className="h-4 w-4" />
            Позвонить
          </a>
        </div>

        <a
          href={site.vkUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={site.vkAriaLabel}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
        >
          <VkIcon className="h-4 w-4" />
          Мы ВКонтакте
        </a>
      </div>
    </section>
  );
}
