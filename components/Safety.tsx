import { safetyCards } from "@/data/content";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";

export function Safety() {
  return (
    <section id="safety" className="bg-marine-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="Безопасность и правила"
              title="Всё понятно перед выходом на воду"
              subtitle="Перед каждой прогулкой проводим бесплатный подробный инструктаж, объясняем управление, маршрут и правила движения по воде."
            />
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              Понятные правила, средства безопасности, согласованные маршруты и
              контроль погодных условий — чтобы прогулка прошла спокойно и
              оставила только хорошие впечатления.
            </p>
          </div>

          <RevealGroup className="grid gap-3 sm:grid-cols-2">
            {safetyCards.map((c) => {
              const highlight = "highlight" in c && c.highlight;
              return (
                <div
                  key={c.title}
                  className={`rounded-2xl border p-5 ${
                    highlight
                      ? "border-amber-200 bg-amber-50"
                      : "border-marine-100 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      className={`mt-0.5 h-5 w-5 flex-none ${
                        highlight ? "text-amber-500" : "text-sea-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {highlight ? (
                        <>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M5.7 5.7l12.6 12.6" />
                        </>
                      ) : (
                        <path d="M20 6L9 17l-5-5" />
                      )}
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
              );
            })}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
