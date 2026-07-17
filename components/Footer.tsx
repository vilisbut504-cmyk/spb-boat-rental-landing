import Image from "next/image";
import Link from "next/link";
import { legalLinks, site } from "@/data/site";
import { brandAssets } from "@/data/content";
import {
  MaxIcon,
  PhoneIcon,
  TelegramIcon,
  VkIcon,
  WhatsAppIcon,
} from "@/components/SocialIcons";
import { CopyMaxNumber } from "@/components/CopyMaxNumber";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-marine-100 bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="inline-flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white/95 p-2 ring-1 ring-white/20">
                <Image
                  src={brandAssets.logoSmall}
                  alt=""
                  width={260}
                  height={260}
                  className="h-10 w-10 object-contain"
                />
              </span>
              <span>
                <span className="block text-base font-bold leading-snug text-white">
                  {site.name}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
                  {site.brandSubtitle}
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              {site.tagline}. Самостоятельные прогулки по Неве, каналам и
              Финскому заливу — без прав, легально, после инструктажа.
            </p>
            <p className="mt-3 text-sm text-white/50">{site.city}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Навигация
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/certificates"
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  Подарочные сертификаты
                </Link>
              </li>
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Контакты
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <a
                  href={site.phoneHref}
                  aria-label={site.phoneAriaLabel}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <PhoneIcon className="h-4 w-4 shrink-0" />
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={site.whatsappAriaLabel}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                  WhatsApp · {site.whatsappDisplay}
                </a>
              </li>
              <li>
                <span className="inline-flex flex-wrap items-center gap-2">
                  <MaxIcon className="h-4 w-4 shrink-0" />
                  MAX · {site.maxDisplay}
                  <CopyMaxNumber
                    number={site.maxCanonical}
                    className="rounded-full border border-white/25 px-3 py-0.5 text-xs font-medium text-white/70 transition-colors hover:border-white/60 hover:text-white"
                  />
                </span>
              </li>
              <li>
                <a
                  href={site.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={site.telegramAriaLabel}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <TelegramIcon className="h-4 w-4 shrink-0" />
                  {site.telegramUsername}
                </a>
              </li>
              <li>
                <a
                  href={site.vkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={site.vkAriaLabel}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <VkIcon className="h-4 w-4 shrink-0" />
                  Мы ВКонтакте
                </a>
              </li>
              <li className="leading-relaxed">
                {site.addressShort}
                <br />
                <span className="text-white/50">{site.landmark}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {year} {site.name} · {site.city}
        </div>
      </div>
    </footer>
  );
}
