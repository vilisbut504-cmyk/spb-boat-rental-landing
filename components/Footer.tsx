import Link from "next/link";
import { legalLinks, navLinks, site } from "@/data/site";

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="text-gold-500">⚓</span>
            {site.name}
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            Аренда катеров с капитаном в Санкт-Петербурге. Прогулки по Неве и
            каналам, развод мостов и индивидуальные маршруты для любого случая.
          </p>
          <div className="mt-6 space-y-1 text-sm text-white/70">
            <p>{site.address}</p>
            <p>{site.workHours}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
            Навигация
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
            Контакты
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <a href={site.phoneHref} className="hover:text-white">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-xs text-white/50 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Все права защищены.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
