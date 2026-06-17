"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navLinks, site } from "@/data/site";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className={`flex items-center gap-2 font-bold tracking-tight transition-colors ${
            scrolled ? "text-navy-900" : "text-white"
          }`}
        >
          <span className="text-gold-500 text-xl">⚓</span>
          <span className="text-lg">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-gold-500 ${
                scrolled ? "text-navy-800" : "text-white/90"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={site.phoneHref}
            className={`text-sm font-semibold transition-colors ${
              scrolled ? "text-navy-900" : "text-white"
            }`}
          >
            {site.phone}
          </a>
          <a
            href="#booking"
            className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-400"
          >
            Забронировать
          </a>
        </div>

        <button
          type="button"
          aria-label="Меню"
          onClick={() => setOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center md:hidden ${
            scrolled || open ? "text-navy-900" : "text-white"
          }`}
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-6 bg-current transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-white px-6 py-8 md:hidden">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-2xl font-semibold text-navy-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-10 flex flex-col gap-4">
            <a
              href={site.phoneHref}
              className="text-lg font-bold text-navy-900"
            >
              {site.phone}
            </a>
            <a
              href="#booking"
              onClick={() => setOpen(false)}
              className="rounded-full bg-gold-500 px-6 py-3 text-center font-semibold text-navy-900"
            >
              Забронировать
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
