import { scenarios } from "@/data/content";
import { Icon } from "@/components/Icon";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";

export function Scenarios() {
  return (
    <section className="bg-gradient-to-b from-white to-milk py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Поводы"
          title="Прогулка на нашем катере подходит под любой красивый повод"
          subtitle="Выберите настроение, а мы поможем подобрать катер, время и маршрут."
        />

        <RevealGroup className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="group flex items-center gap-4 rounded-2xl border border-marine-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-marine-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-marine-50 text-marine-600 transition-colors group-hover:bg-marine-600 group-hover:text-white">
                <Icon name={s.icon} className="h-6 w-6" />
              </span>
              <span className="font-semibold text-ink">{s.title}</span>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
