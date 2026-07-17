import { steps, stepNotes } from "@/data/content";
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

        <RevealGroup className="mt-14">
          <ol className="relative space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {/* connecting line (desktop) */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-marine-100 via-marine-200 to-marine-100 lg:block"
              aria-hidden="true"
            />
            {steps.map((step) => (
              <li
                key={step.n}
                className="relative rounded-2xl border border-marine-100 bg-milk p-6 transition-all hover:-translate-y-1 hover:shadow-md lg:mt-16 lg:first:mt-16"
              >
                <span className="absolute -top-7 left-6 hidden h-14 w-14 items-center justify-center rounded-full border border-marine-200 bg-white text-lg font-extrabold text-marine-600 shadow-sm lg:flex">
                  {step.n}
                </span>
                <span className="text-3xl font-extrabold text-marine-200 lg:hidden">
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-semibold leading-snug text-ink lg:mt-8">
                  {step.title}
                  {step.titleExclamation && (
                    <span className="text-red-600">!</span>
                  )}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </RevealGroup>

        <div className="mt-10 grid gap-3 rounded-2xl border border-marine-100 bg-marine-50 p-6 sm:grid-cols-2">
          {stepNotes.map((note) => (
            <p
              key={note}
              className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-sea-400"
                aria-hidden="true"
              />
              {note}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
