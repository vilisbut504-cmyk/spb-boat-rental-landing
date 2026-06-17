import { routes } from "@/data/routes";

export function Routes() {
  return (
    <section id="routes" className="bg-navy-900 py-20 text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
            Маршруты
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Куда отправимся
          </h2>
          <p className="mt-4 text-white/60">
            Готовые направления или индивидуальный маршрут — обсудим точки и
            время старта при бронировании.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
          {routes.map((route) => (
            <div
              key={route.title}
              className="bg-navy-900 p-8 transition-colors hover:bg-navy-800"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{route.title}</h3>
                <span className="rounded-full border border-gold-400/40 px-3 py-1 text-xs text-gold-400">
                  {route.duration}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {route.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
