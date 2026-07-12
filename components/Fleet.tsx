import { boats, fleetPromoCard } from "@/data/boats";
import { fleetEngineNote } from "@/data/content";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";
import { BoatCard } from "@/components/BoatCard";
import { FleetPromoCardView } from "@/components/FleetPromoCard";

export function Fleet() {
  return (
    <section id="boats" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Катера"
          title="Выберите катер на свой вкус"
          subtitle="В парке 7 реальных катеров — выберите свой для прогулки по Неве, каналам и Финскому заливу."
        />

        <p className="mt-4 text-sm text-ink-soft">{fleetEngineNote}</p>
        <p className="mt-2 text-sm text-ink-soft">
          Подробности по конкретной модели можно уточнить у менеджера.
        </p>

        <RevealGroup className="mt-12 grid gap-8 md:grid-cols-2">
          {boats.map((boat) => (
            <BoatCard key={boat.slug} boat={boat} />
          ))}
          <FleetPromoCardView
            title={fleetPromoCard.title}
            description={fleetPromoCard.description}
          />
        </RevealGroup>
      </div>
    </section>
  );
}
