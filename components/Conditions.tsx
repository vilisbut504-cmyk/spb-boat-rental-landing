import { conditions } from "@/data/content";
import { SectionHeading } from "@/components/SectionHeading";

export function Conditions() {
  return (
    <section id="conditions" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Цены и условия"
          title="Честно об условиях"
          subtitle="Мы не публикуем выдуманных цен. Финальные условия зависят от катера, маршрута и даты."
        />

        <div className="mt-12 overflow-hidden rounded-2xl border border-marine-100 bg-milk">
          <ul className="divide-y divide-marine-100">
            {conditions.map((c, i) => (
              <li
                key={c}
                className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-white"
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-marine-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-base text-ink">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          Точную стоимость, минимальное время и размер залога подтверждает
          менеджер после заявки.
        </p>
      </div>
    </section>
  );
}
