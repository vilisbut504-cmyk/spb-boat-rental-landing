"use client";

import { useState } from "react";
import Image from "next/image";
import type { Boat } from "@/data/boats";
import { useBooking } from "@/components/BookingProvider";

type Props = {
  boat: Boat;
  priority?: boolean;
};

function SpecRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="shrink-0 text-ink-soft">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

export function BoatCard({ boat, priority = false }: Props) {
  const { scrollToBooking, scrollToTariffs } = useBooking();
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = boat.images.length > 0;
  const mainSrc = hasImages ? boat.images[activeIndex] : null;

  const displayName = boat.shortName
    ? `${boat.name} · ${boat.shortName}`
    : boat.name;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-marine-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        {boat.badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-marine-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            {boat.badge}
          </span>
        )}

        {mainSrc ? (
          <div className="relative aspect-[900/650] w-full overflow-hidden bg-marine-50">
            <Image
              src={mainSrc}
              alt={`${boat.name} — фото ${activeIndex + 1}`}
              width={900}
              height={650}
              className="h-full w-full object-cover"
              priority={priority && activeIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex aspect-[900/650] w-full items-center justify-center bg-marine-50 text-sm font-medium text-ink-soft">
            Фото скоро
          </div>
        )}

        {boat.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-marine-100 bg-milk p-3 [-webkit-overflow-scrolling:touch]">
            {boat.thumbnails.map((thumb, i) => (
              <button
                key={thumb}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative h-[72px] w-[100px] flex-none overflow-hidden rounded-lg border-2 transition-colors sm:h-[100px] sm:w-[140px] ${
                  i === activeIndex
                    ? "border-marine-600"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
                aria-label={`Показать фото ${i + 1}`}
                aria-pressed={i === activeIndex}
              >
                <Image
                  src={thumb}
                  alt=""
                  width={140}
                  height={100}
                  className="h-full w-full object-cover"
                  sizes="140px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-ink">{displayName}</h3>

        {boat.priceFrom && (
          <p className="mt-2 text-lg font-semibold text-marine-700">
            от {boat.priceFrom}
          </p>
        )}

        {boat.description && (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {boat.description}
          </p>
        )}

        <dl className="mt-4 space-y-2.5">
          <SpecRow label="Вместимость" value={boat.capacity} />
          <SpecRow label="Инструктаж" value={boat.instructionNote} />
          <SpecRow label="Залог" value={boat.depositNote} />
        </dl>

        {boat.engineNote && (
          <p className="mt-4 text-sm text-ink-soft">{boat.engineNote}</p>
        )}

        {boat.comfort && boat.comfort.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              На борту
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {boat.comfort.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-marine-50 px-3 py-1 text-xs text-marine-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {boat.bestFor && boat.bestFor.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Подходит для
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {boat.bestFor.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-mist px-3 py-1 text-xs text-ink-soft"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => scrollToBooking({ boatName: boat.name })}
            className="flex-1 rounded-full bg-marine-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-marine-700"
          >
            Забронировать
          </button>
          <button
            type="button"
            onClick={scrollToTariffs}
            className="flex-1 rounded-full border border-marine-200 px-5 py-3 text-center text-sm font-semibold text-marine-700 transition-colors hover:border-marine-500"
          >
            Смотреть тарифы
          </button>
        </div>
      </div>
    </article>
  );
}
