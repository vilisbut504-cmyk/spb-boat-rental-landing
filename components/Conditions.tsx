import {
  tariffPanels,
  tariffIncluded,
  captainServiceNote,
  tariffConditions,
  tariffDisclaimer,
  specialTariffNote,
} from "@/data/content";
import { SectionHeading } from "@/components/SectionHeading";

export function Conditions() {
  return (
    <section id="tariffs" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Тарифы"
          title="Тарифы и условия аренды"
          subtitle="Стоимость зависит от дня недели и длительности прогулки. Менеджер подтвердит свободное время, катер и маршрут."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {tariffPanels.map((panel) => (
            <div
              key={panel.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-marine-100 bg-milk"
            >
              <div
                className={`px-6 py-5 sm:px-8 ${
                  panel.id === "weekday" ? "bg-marine-600" : "bg-marine-700"
                }`}
              >
                <h3 className="text-lg font-bold text-white sm:text-xl">
                  {panel.days}
                </h3>
              </div>

              <ul className="flex-1 divide-y divide-marine-100">
                {panel.rows.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 px-6 py-4 sm:px-8"
                  >
                    <span className="font-medium text-ink">
                      {row.label}
                      {row.note && (
                        <span className="ml-2 text-xs font-normal text-ink-soft">
                          {row.note}
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mx-1 hidden flex-1 border-b border-dotted border-marine-200 sm:block"
                    />
                    <span className="shrink-0 text-lg font-bold text-marine-700">
                      {row.price}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-marine-100 bg-white/60 px-6 py-5 sm:px-8">
                {panel.perks.map((perk) => (
                  <p
                    key={perk}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-sea-400"
                      aria-hidden="true"
                    />
                    {perk}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-sea-400/30 bg-sea-400/10 px-6 py-5 text-sm leading-relaxed text-marine-800">
          <p className="font-medium">{specialTariffNote}</p>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-marine-100 bg-milk p-6 sm:grid-cols-2">
          {tariffIncluded.map((item) => (
            <p
              key={item}
              className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-sea-400"
                aria-hidden="true"
              />
              {item}
            </p>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-marine-100 bg-marine-50 px-6 py-5 text-sm leading-relaxed text-ink-soft">
          <p>{captainServiceNote}</p>
        </div>

        <div className="mt-12">
          <h3 className="text-lg font-semibold text-ink">Условия</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {tariffConditions.map((c) => (
              <li
                key={c}
                className="flex items-start gap-3 rounded-xl border border-marine-100 bg-milk px-5 py-4 text-sm text-ink-soft"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sea-400"
                  aria-hidden="true"
                />
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-2xl border border-marine-100 bg-marine-50 px-6 py-5 text-sm leading-relaxed text-ink-soft">
          <p>{tariffDisclaimer}</p>
        </div>
      </div>
    </section>
  );
}
