import Link from "next/link";
import { legalLinks, navLinks, site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-marine-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-bold tracking-tight text-ink">
            {site.name}
          </div>
          <p className="mt-1 text-sm font-medium text-marine-600">{site.city}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            Аренда катера без капитана в Санкт-Петербурге. Самостоятельные
            прогулки по Неве, каналам и Финскому заливу после инструктажа.
          </p>
          <p className="mt-4 text-sm text-ink-soft">{site.workHours}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
            Разделы
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-marine-600">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
            Документы
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-marine-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-marine-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-xs text-ink-soft sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {site.city}.
          </p>
          <p className="max-w-md md:text-right">
            Финальные условия аренды подтверждаются менеджером перед
            бронированием.
          </p>
        </div>
      </div>
    </footer>
  );
}
