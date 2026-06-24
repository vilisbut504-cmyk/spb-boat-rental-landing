import { boats } from "@/data/boats";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";
import { BoatCard } from "@/components/BoatCard";

export function Fleet() {
  return (
    <section id="boats" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Катера"
          title="Выберите катер для прогулки"
          subtitle="Реальные катера из нашего парка. Точные характеристики и условия допуска подтверждает менеджер при бронировании."
        />

        <RevealGroup className="mt-12 grid gap-8 md:grid-cols-2">
          {boats.map((boat, index) => (
            <BoatCard key={boat.slug} boat={boat} priority={index < 2} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
