import { advantages } from "@/data/content";
import { Icon } from "@/components/Icon";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";

export function Advantages() {
  return (
    <section id="advantages" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Преимущества"
          title="Свобода на воде — в ваших руках"
          subtitle="Это не просто прогулка, а возможность самому управлять катером и наслаждаться видами Санкт-Петербурга с воды — настоящей Северной Венеции."
        />

        {/* 6 cards → clean 3×2 grid on large screens */}
        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a) => (
            <div
              key={a.title}
              className="group rounded-2xl border border-marine-100 bg-milk p-6 transition-all hover:-translate-y-1 hover:border-marine-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-marine-50 text-marine-600 transition-colors group-hover:bg-marine-600 group-hover:text-white">
                <Icon name={a.icon} className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-ink">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {a.text}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
