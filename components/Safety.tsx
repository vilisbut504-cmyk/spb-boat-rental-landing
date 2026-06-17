import { safetyCards } from "@/data/content";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";

export function Safety() {
  return (
    <section id="safety" className="bg-marine-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Безопасность и правила"
              title="Спокойно и подготовленно"
            />
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              Перед прогулкой проводится инструктаж. Мы объясняем маршрут,
              правила движения и ограничения. На борту предусмотрены средства
              безопасности. При небезопасной погоде прогулка может быть
              перенесена.
            </p>
          </div>

          <RevealGroup className="grid gap-3 sm:grid-cols-2">
            {safetyCards.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-marine-100 bg-white p-5"
              >
                <div className="flex items-start gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-5 w-5 flex-none text-sea-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {c.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
