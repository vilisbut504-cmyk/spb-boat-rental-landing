import { scenarios } from "@/data/content";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";

export function Scenarios() {
  return (
    <section className="bg-milk py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Для кого"
          title="Прогулка под любой повод"
          subtitle="Подберём катер и маршрут под формат вашей прогулки по Петербургу."
        />

        <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="flex items-center gap-4 rounded-2xl border border-marine-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-2xl" aria-hidden="true">
                {s.emoji}
              </span>
              <span className="font-semibold text-ink">{s.title}            </span>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
