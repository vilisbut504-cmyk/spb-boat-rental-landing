import Link from "next/link";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="bg-background pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-navy-600 hover:text-gold-500"
        >
          ← На главную
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-navy-800/50">Обновлено: {updated}</p>
        <div className="legal-content mt-10 space-y-6 text-navy-800/80">
          {children}
        </div>
      </div>
    </article>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-navy-900">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
