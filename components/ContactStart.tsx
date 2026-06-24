import { site } from "@/data/site";
import { SectionHeading } from "@/components/SectionHeading";

export function ContactStart() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Связь"
          title="Точка старта и связь"
          center
        />
        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-ink-soft">
          {site.city}. Точная точка старта, свободное время и маршрут
          подтверждаются менеджером при бронировании.
        </p>

        <dl className="mx-auto mt-8 max-w-md space-y-4 rounded-2xl border border-marine-100 bg-milk px-6 py-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Телефон</dt>
            <dd className="font-medium text-ink">{site.phone}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Telegram</dt>
            <dd className="font-medium text-ink">уточняется</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">WhatsApp</dt>
            <dd className="font-medium text-ink">уточняется</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
