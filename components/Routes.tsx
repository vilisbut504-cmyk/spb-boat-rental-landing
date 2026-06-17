import { routes } from "@/data/routes";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";

export function Routes() {
  return (
    <section id="routes" className="bg-milk py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Маршруты"
          title="Откройте Петербург с воды"
          subtitle="Готовые направления, которые можно совместить под ваше время на воде."
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
                  <div className="flex items-center gap-2">
                    <span className="text-ink-soft">Настроение:</span>
                    <span className="font-medium text-marine-700">
                      {route.mood}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-ink-soft">Длительность:</span>
                    <span className="font-medium text-ink">
                      {route.duration}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
