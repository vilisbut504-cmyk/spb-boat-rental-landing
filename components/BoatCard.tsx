"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { Boat } from "@/data/boats";
import { useBooking } from "@/components/BookingProvider";
import { specialTariffRows } from "@/data/pricing";

type Props = {
  boat: Boat;
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

function BoatLightbox({
  boat,
  index,
  onClose,
  onIndexChange,
}: {
  boat: Boat;
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const src = boat.images[index];
  const alt =
    boat.imageAlts?.[index] ?? `${boat.name} — фото ${index + 1}`;

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        onIndexChange((index + 1) % boat.images.length);
      }
      if (e.key === "ArrowLeft") {
        onIndexChange((index - 1 + boat.images.length) % boat.images.length);
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onIndexChange, index, boat.images.length]);

  if (!src) return null;

  // Portal to <body>: the boat card has `overflow-hidden` + a hover transform,
  // which would otherwise become the containing block for this fixed overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-ink/90 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${boat.name} — просмотр фото`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-none items-center justify-between gap-4 pb-3">
        <p className="truncate text-sm font-semibold text-white">
          {boat.name}
          <span className="ml-2 font-normal text-white/60">
            {index + 1} / {boat.images.length}
          </span>
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Закрыть фото"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div
        className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {boat.images.length > 1 && (
          <button
            type="button"
            onClick={() =>
              onIndexChange((index - 1 + boat.images.length) % boat.images.length)
            }
            className="absolute left-1 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white sm:left-3"
            aria-label="Предыдущее фото"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}

        <div className="relative h-full max-h-[75vh] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-contain"
            priority
          />
        </div>

        {boat.images.length > 1 && (
          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % boat.images.length)}
            className="absolute right-1 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white sm:right-3"
            aria-label="Следующее фото"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      {boat.images.length > 1 && (
        <div
          className="mx-auto mt-3 flex max-w-5xl flex-none gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
          onClick={(e) => e.stopPropagation()}
        >
          {boat.thumbnails.map((thumb, i) => (
            <button
              key={`${boat.slug}-lb-thumb-${i}`}
              type="button"
              onClick={() => onIndexChange(i)}
              className={`relative h-14 w-20 flex-none overflow-hidden rounded-lg border-2 ${
                i === index ? "border-white" : "border-transparent opacity-70"
              }`}
              aria-label={`Показать фото ${i + 1}`}
              aria-pressed={i === index}
            >
              <Image
                src={thumb}
                alt=""
                width={80}
                height={56}
                className="h-full w-full object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

export function BoatCard({ boat }: Props) {
  const { scrollToBooking, scrollToTariffs } = useBooking();
  const [activeIndex, setActiveIndex] = useState(0);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [specialOpen, setSpecialOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const openTriggerRef = useRef<HTMLButtonElement>(null);

  const hasImages = boat.images.length > 0;
  const mainSrc = hasImages ? boat.images[activeIndex] : null;
  const mainAlt =
    boat.imageAlts?.[activeIndex] ?? `${boat.name} — аренда без капитана`;

  const displayName = boat.shortName
    ? `${boat.name} · ${boat.shortName}`
    : boat.name;

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    openTriggerRef.current?.focus();
  }, []);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-marine-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        {boat.badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-marine-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
            {boat.badge}
          </span>
        )}
        {boat.specialTariff && (
          <span
            className={`absolute z-10 rounded-full bg-sea-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm ${
              boat.badge ? "right-4 top-4" : "left-4 top-4"
            }`}
          >
            Специальный тариф
          </span>
        )}

        {mainSrc ? (
          <button
            ref={openTriggerRef}
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="relative block aspect-[900/650] w-full overflow-hidden bg-marine-50 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine-600"
            aria-label={`Открыть фото ${boat.name} крупнее`}
          >
            <Image
              src={mainSrc}
              alt={mainAlt}
              width={900}
              height={650}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
              Открыть
            </span>
          </button>
        ) : (
          <div className="flex aspect-[900/650] w-full items-center justify-center bg-gradient-to-br from-marine-50 to-mist px-6 text-center">
            <div>
              <p className="text-sm font-semibold text-marine-700">
                Фото скоро
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Актуальные кадры модели уточнит менеджер
              </p>
            </div>
          </div>
        )}

        {boat.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-marine-100 bg-milk p-3 [-webkit-overflow-scrolling:touch]">
            {boat.thumbnails.map((thumb, i) => (
              <button
                key={`${boat.slug}-thumb-${i}`}
                type="button"
                onClick={() => setActiveIndex(i)}
                onDoubleClick={() => {
                  setActiveIndex(i);
                  setLightboxOpen(true);
                }}
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
          <div className="mt-2">
            <p className="text-lg font-semibold text-marine-700">
              от {boat.priceFrom}
            </p>
            {boat.bookingNote && (
              <p className="mt-1 text-sm font-medium text-ink-soft">
                {boat.bookingNote}
              </p>
            )}
          </div>
        )}

        {boat.description && (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {boat.description}
          </p>
        )}

        <dl className="mt-4 space-y-2.5">
          <SpecRow label="Вместимость" value={boat.capacity} />
          <SpecRow label="Инструктаж" value={boat.instructionNote} />
        </dl>

        {boat.specialTariff && (
          <>
            <button
              type="button"
              onClick={() => setSpecialOpen((v) => !v)}
              className="mt-4 flex w-full items-center justify-between rounded-xl border border-sea-400/40 bg-sea-400/10 px-4 py-3 text-left text-sm font-semibold text-marine-800 transition-colors hover:border-sea-400"
              aria-expanded={specialOpen}
            >
              Специальный тариф (+500 ₽)
              <span
                className={`text-sea-500 transition-transform ${specialOpen ? "rotate-45" : ""}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            {specialOpen && (
              <div className="mt-3 space-y-4 rounded-xl border border-marine-100 bg-white px-4 py-3 text-sm">
                <p className="text-xs leading-relaxed text-ink-soft">
                  К каждому базовому тарифу прибавляется 500 ₽. Доплата за пятого
                  пассажира — отдельно 1 000 ₽.
                </p>
                {(
                  [
                    { id: "weekday" as const, title: "Пн–Чт" },
                    { id: "weekend" as const, title: "Пт–Вс" },
                  ] as const
                ).map((block) => (
                  <div key={block.id}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      {block.title}
                    </p>
                    <ul className="mt-2 divide-y divide-marine-50">
                      {specialTariffRows(block.id).map((row) => (
                        <li
                          key={`${block.id}-${row.label}`}
                          className="flex items-baseline justify-between gap-3 py-1.5"
                        >
                          <span className="text-ink-soft">
                            {row.label}
                            {row.note ? (
                              <span className="ml-1 text-[11px]">
                                ({row.note})
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 font-semibold text-marine-700">
                            {row.priceLabel}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => setSpecsOpen((v) => !v)}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-marine-100 bg-milk px-4 py-3 text-left text-sm font-semibold text-marine-700 transition-colors hover:border-marine-300"
          aria-expanded={specsOpen}
        >
          Характеристики
          <span
            className={`text-marine-500 transition-transform ${specsOpen ? "rotate-45" : ""}`}
            aria-hidden="true"
          >
            +
          </span>
        </button>

        {specsOpen && (
          <dl className="mt-3 space-y-2.5 rounded-xl border border-marine-100 bg-white px-4 py-3">
            <SpecRow label="Год выпуска" value={boat.year} />
            <SpecRow label="Двигатель" value={boat.engine} />
            <SpecRow label="Мощность" value={boat.power} />
            <SpecRow label="Макс. скорость" value={boat.maxSpeed} />
            <SpecRow label="Тип хода" value={boat.hullType} />
            <SpecRow label="Бензобак" value={boat.fuelTank} />
          </dl>
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

        <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
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

      {lightboxOpen && (
        <BoatLightbox
          boat={boat}
          index={activeIndex}
          onClose={closeLightbox}
          onIndexChange={setActiveIndex}
        />
      )}
    </article>
  );
}
