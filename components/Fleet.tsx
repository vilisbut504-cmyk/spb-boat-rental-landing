import { boats } from "@/data/boats";

const priceFormatter = new Intl.NumberFormat("ru-RU");

export function Fleet() {
  return (
    <section id="fleet" className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
              Наши катера
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Выберите катер под компанию
            </h2>
          </div>
          <a
            href="#booking"
            className="text-sm font-semibold text-navy-600 hover:text-gold-500"
          >
            Подобрать под событие →
          </a>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {boats.map((boat) => (
            <article
              key={boat.id}
              className="group overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-transform hover:-translate-y-1"
            >
              <div
                className={`relative h-52 bg-gradient-to-br ${boat.gradient}`}
              >
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(120deg, transparent 0 22px, rgba(255,255,255,0.12) 22px 24px)",
                  }}
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy-900">
                  до {boat.guests} гостей
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-navy-900">{boat.name}</h3>
                <p className="mt-1 text-sm text-navy-800/60">{boat.type}</p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {boat.features.map((f) => (
                    <li
                      key={f}
                      className="rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-700"
                    >
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-end justify-between border-t border-navy-100 pt-5">
                  <div>
                    <div className="text-2xl font-bold text-navy-900">
                      {priceFormatter.format(boat.pricePerHour)} ₽
                    </div>
                    <div className="text-xs text-navy-800/50">за час</div>
                  </div>
                  <a
                    href="#booking"
                    className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-gold-500 group-hover:text-navy-900"
                  >
                    Выбрать
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
