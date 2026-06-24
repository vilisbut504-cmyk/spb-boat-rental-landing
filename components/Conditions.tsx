import {
  tariffs,
  tariffConditions,
  tariffDisclaimer,
  rightsNote,
} from "@/data/content";
import { SectionHeading } from "@/components/SectionHeading";

export function Conditions() {
  return (
    <section id="tariffs" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Тарифы"
          title="Тарифы и условия аренды"
          subtitle="Стоимость зависит от катера, даты, времени и маршрута. Финальные условия подтверждает менеджер перед бронированием."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-ink">Тарифы</h3>
            <ul className="mt-4 divide-y divide-marine-100 overflow-hidden rounded-2xl border border-marine-100 bg-milk">
              {tariffs.map((t) => (
                <li
                  key={t.label}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white"
                >
                  <span className="font-medium text-ink">{t.label}</span>
                  <span className="shrink-0 font-semibold text-marine-700">
                    {t.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Условия</h3>
            <ul className="mt-4 space-y-3">
              {tariffConditions.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-3 rounded-xl border border-marine-100 bg-milk px-5 py-4 text-sm text-ink-soft"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sea-400" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 space-y-3 rounded-2xl border border-marine-100 bg-marine-50 px-6 py-5 text-sm leading-relaxed text-ink-soft">
          <p>{tariffDisclaimer}</p>
          <p>{rightsNote}</p>
        </div>
      </div>
    </section>
  );
}
