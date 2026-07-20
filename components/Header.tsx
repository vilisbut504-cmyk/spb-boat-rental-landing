"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/site";
import { brandAssets } from "@/data/content";
import { site } from "@/data/site";
import { useBooking } from "@/components/BookingProvider";
import { PhoneIcon } from "@/components/SocialIcons";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { scrollToBooking } = useBooking();
  const navHref = (href: string) => (pathname === "/" ? href : `/${href}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    document.body.dataset.menuOpen = menuOpen ? "true" : "false";
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.body.dataset.menuOpen = "false";
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const headerClass = scrolled
    ? "border-b border-marine-100 bg-white/90 shadow-sm backdrop-blur-md"
    : "bg-white/80 backdrop-blur-sm";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${headerClass}`}
      >
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[80px] sm:gap-4 sm:px-8">
          <Link
            href="/"
            className="group flex min-w-0 shrink items-center gap-2.5 sm:gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-marine-100 sm:h-[68px] sm:w-[68px]">
              <Image
                src={brandAssets.logoSmall}
                alt={brandAssets.logoAlt}
                width={280}
                height={168}
                className="h-[52px] w-auto object-contain sm:h-[64px]"
                priority
              />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[13px] font-bold leading-snug tracking-tight text-ink sm:text-base lg:text-lg">
                {site.name}
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft sm:text-[11px] sm:tracking-[0.14em]">
                {site.brandSubtitle}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Основное меню">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={navHref(link.href)}
                className="text-sm font-medium text-ink-soft transition-colors hover:text-marine-700"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={site.phoneHref}
              aria-label={site.phoneAriaLabel}
              className="hidden items-center gap-2 rounded-full border border-marine-100 bg-white px-3.5 py-2 text-sm font-semibold text-marine-700 transition-colors hover:border-marine-400 md:inline-flex"
            >
              <PhoneIcon className="h-4 w-4 shrink-0 text-sea-500" />
              <span className="whitespace-nowrap">{site.phoneDisplay}</span>
            </a>

            <a
              href={site.phoneHref}
              aria-label={site.phoneAriaLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-marine-100 text-marine-700 transition-colors hover:border-marine-400 md:hidden"
            >
              <PhoneIcon className="h-5 w-5" />
            </a>

            <button
              type="button"
              onClick={() => scrollToBooking()}
              className="hidden rounded-full border border-marine-600 px-5 py-2.5 text-sm font-semibold text-marine-700 transition-colors hover:bg-marine-50 sm:inline-flex"
            >
              Забронировать
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-marine-100 text-ink lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <nav
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(100%,320px)] flex-col bg-white p-6 shadow-2xl transition-transform duration-300 lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Мобильное меню"
      >
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-milk ring-1 ring-marine-100">
            <Image
              src={brandAssets.logoSmall}
              alt=""
              width={280}
              height={168}
              className="h-11 w-auto object-contain"
            />
          </span>
          <div>
            <p className="text-base font-bold leading-snug text-ink">
              {site.name}
            </p>
            <p className="text-xs text-ink-soft">{site.brandSubtitle}</p>
          </div>
        </div>

        <ul className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={navHref(link.href)}
                className="block rounded-xl px-3 py-3 text-lg font-semibold text-ink transition-colors hover:bg-marine-50"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={site.phoneHref}
          aria-label={site.phoneAriaLabel}
          className="mt-6 flex items-center justify-center gap-2 rounded-full border border-marine-200 px-5 py-3.5 font-semibold text-marine-700"
          onClick={() => setMenuOpen(false)}
        >
          <PhoneIcon className="h-5 w-5" />
          {site.phoneDisplay}
        </a>

        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            scrollToBooking();
          }}
          className="mt-3 rounded-full bg-marine-600 px-5 py-3.5 text-center font-semibold text-white"
        >
          Забронировать
        </button>
      </nav>
    </>
  );
}
