import { steps } from "@/data/content";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";

export function Steps() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Как проходит аренда"
          title="От заявки до выхода на воду"
          subtitle="Прозрачный порядок: вы всегда знаете, что будет на каждом шаге."
        />

        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.n}
              className="relative rounded-2xl border border-marine-100 bg-milk p-6"
            >
              <span className="text-4xl font-extrabold text-marine-100">
                {step.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {step.text}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
