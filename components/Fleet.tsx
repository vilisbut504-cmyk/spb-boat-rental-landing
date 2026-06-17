import { boats } from "@/data/boats";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";

export function Fleet() {
  return (
    <section id="boats" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Катера"
          title="Выберите катер для прогулки"
          subtitle="Три катера под разные форматы. Точные характеристики и условия допуска подтверждает менеджер при бронировании."
        />

        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {boats.map((boat) => (
            <article
              key={boat.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-marine-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="aspect-[8/5] w-full bg-marine-50 bg-cover bg-center"
                style={{ backgroundImage: `url('${boat.image}')` }}
                role="img"
                aria-label={boat.name}
              />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-ink">{boat.name}</h3>

                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Вместимость</dt>
                    <dd className="text-right font-medium text-ink">
                      {boat.capacity}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Формат</dt>
                    <dd className="text-right font-medium text-ink">
                      {boat.format}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Условия допуска</dt>
                    <dd className="text-right font-medium text-ink">
                      {boat.access}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">Цена</dt>
                    <dd className="text-right font-medium text-ink">
                      {boat.price}
                    </dd>
                  </div>
                </dl>

                <a
                  href="#booking"
                  className="mt-6 rounded-full bg-marine-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-marine-700"
                >
                  Забронировать
                </a>
              </div>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
