"use client";

import { routes } from "@/data/routes";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";
import { useBooking } from "@/components/BookingProvider";

export function Routes() {
  const { scrollToBooking } = useBooking();

  return (
    <section id="routes" className="bg-milk py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Маршруты"
          title="Откройте для себя Петербург по-новому"
          subtitle="Готовые яркие маршруты по каналам города, Неве и Финскому заливу — для свидания, компании, дня рождения или красивой прогулки на закате."
        />

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <article
              key={route.title}
              className="group flex flex-col overflow-hidden rounded-2xl border border-marine-100 bg-white transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="aspect-[8/5] w-full overflow-hidden bg-marine-50 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
                style={{ backgroundImage: `url('${route.image}')` }}
                role="img"
                aria-label={route.title}
              />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-ink">{route.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  {route.description}
                </p>
                <div className="mt-5 space-y-2 border-t border-marine-100 pt-4 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                    <span className="text-ink-soft">Настроение:</span>
                    <span className="font-medium text-marine-700">
                      {route.mood}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                    <span className="text-ink-soft">Подходит для:</span>
                    <span className="font-medium text-ink">{route.forWho}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToBooking({ routeName: route.title })}
                  className="mt-5 w-full rounded-full border border-marine-200 px-5 py-3 text-sm font-semibold text-marine-700 transition-colors hover:border-marine-500 hover:bg-marine-50"
                >
                  Подобрать маршрут
                </button>
              </div>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
