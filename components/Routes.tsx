"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { routes, mapDisclaimer, type RouteItem } from "@/data/routes";
import { SectionHeading } from "@/components/SectionHeading";
import { RevealGroup } from "@/components/RevealGroup";
import { useBooking } from "@/components/BookingProvider";

/** Night drawbridge visual (SVG) shown until the real photo arrives. */
function DrawbridgeVisual() {
  return (
    <svg
      viewBox="0 0 800 500"
      className="h-full w-full"
      role="img"
      aria-label="Разведённый мост над ночной Невой"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="db-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1d3a" />
          <stop offset="70%" stopColor="#132b52" />
          <stop offset="100%" stopColor="#1a3a66" />
        </linearGradient>
        <linearGradient id="db-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12294a" />
          <stop offset="100%" stopColor="#0a1730" />
        </linearGradient>
        <linearGradient id="db-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0c96a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f0c96a" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="340" fill="url(#db-sky)" />
      <rect y="340" width="800" height="160" fill="url(#db-water)" />

      {/* stars */}
      <g fill="#e8eefc" opacity="0.7">
        <circle cx="90" cy="60" r="1.6" />
        <circle cx="180" cy="110" r="1.2" />
        <circle cx="300" cy="50" r="1.4" />
        <circle cx="520" cy="80" r="1.2" />
        <circle cx="640" cy="45" r="1.6" />
        <circle cx="730" cy="120" r="1.2" />
        <circle cx="420" cy="35" r="1.1" />
      </g>

      {/* moon */}
      <circle cx="668" cy="88" r="26" fill="#f5e9c8" opacity="0.92" />
      <circle cx="678" cy="80" r="24" fill="#132b52" />

      {/* distant city silhouette */}
      <g fill="#0a1730" opacity="0.9">
        <rect x="0" y="300" width="800" height="42" />
        <rect x="40" y="278" width="26" height="30" />
        <rect x="120" y="286" width="34" height="22" />
        <rect x="580" y="282" width="30" height="26" />
        <rect x="700" y="276" width="22" height="32" />
        <path d="M660 300 l8 -40 8 40 z" />
      </g>

      {/* bridge piers */}
      <g fill="#060d1c">
        <rect x="150" y="296" width="76" height="60" rx="3" />
        <rect x="574" y="296" width="76" height="60" rx="3" />
        <rect x="0" y="318" width="180" height="20" />
        <rect x="620" y="318" width="180" height="20" />
      </g>

      {/* raised bridge leaves */}
      <g fill="#04101f" stroke="#f0c96a" strokeOpacity="0.55" strokeWidth="2">
        <path d="M222 300 L380 128 L392 140 L240 306 z" />
        <path d="M578 300 L420 128 L408 140 L560 306 z" />
      </g>

      {/* leaf lights */}
      <g fill="#f5cf76">
        <circle cx="376" cy="136" r="4" />
        <circle cx="424" cy="136" r="4" />
        <circle cx="330" cy="186" r="3" />
        <circle cx="470" cy="186" r="3" />
        <circle cx="284" cy="236" r="3" />
        <circle cx="516" cy="236" r="3" />
        <circle cx="188" cy="292" r="3.4" />
        <circle cx="612" cy="292" r="3.4" />
      </g>

      {/* light reflections in the water */}
      <g opacity="0.8">
        <rect x="370" y="350" width="10" height="90" fill="url(#db-glow)" />
        <rect x="420" y="350" width="10" height="76" fill="url(#db-glow)" />
        <rect x="184" y="350" width="7" height="58" fill="url(#db-glow)" />
        <rect x="610" y="350" width="7" height="64" fill="url(#db-glow)" />
      </g>
      <g stroke="#f0c96a" strokeOpacity="0.35" strokeWidth="2">
        <path d="M340 380 h44" />
        <path d="M410 402 h38" />
        <path d="M356 428 h30" />
        <path d="M170 396 h26" />
        <path d="M600 388 h28" />
      </g>
      <g stroke="#9db8e8" strokeOpacity="0.2" strokeWidth="2">
        <path d="M60 372 h60" />
        <path d="M250 452 h70" />
        <path d="M500 462 h64" />
        <path d="M690 430 h56" />
      </g>
    </svg>
  );
}

function MapLightbox({
  route,
  onClose,
}: {
  route: RouteItem;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!route.image) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-ink/85 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Карта разрешённых зон движения катеров"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-none items-center justify-between gap-4 pb-3">
        <p className="truncate text-sm font-semibold text-white">
          Где могут ходить наши катера
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Закрыть карту"
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
        className="mx-auto min-h-0 w-full max-w-6xl flex-1 overflow-auto overscroll-contain rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={route.image.src}
          alt={route.image.alt}
          width={route.image.width}
          height={route.image.height}
          sizes="(max-width: 1200px) 100vw, 1152px"
          className="h-auto w-full min-w-[640px]"
        />
      </div>

      <p className="mx-auto w-full max-w-6xl flex-none pt-3 text-xs leading-relaxed text-white/70">
        {mapDisclaimer}
      </p>
    </div>
  );
}

function RouteCard({ route }: { route: RouteItem }) {
  const { scrollToBooking } = useBooking();
  const [mapOpen, setMapOpen] = useState(false);
  const mapTriggerRef = useRef<HTMLButtonElement>(null);

  const closeMap = useCallback(() => {
    setMapOpen(false);
    mapTriggerRef.current?.focus();
  }, []);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-marine-100 bg-white transition-all hover:-translate-y-1 hover:shadow-md">
      <div
        className={`relative w-full overflow-hidden ${
          route.isMap ? "bg-white p-2" : "bg-marine-900"
        } aspect-[8/5]`}
      >
        {route.visual === "drawbridge" ? (
          <DrawbridgeVisual />
        ) : route.image ? (
          <Image
            src={route.image.src}
            alt={route.image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={
              route.isMap
                ? "object-contain"
                : "object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            }
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-ink">{route.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {route.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {route.keyPoints.map((point) => (
            <li
              key={point}
              className="rounded-full bg-marine-50 px-3 py-1 text-xs font-medium text-marine-700"
            >
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex-1 space-y-2 border-t border-marine-100 pt-4 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-ink-soft/70">
              Настроение
            </span>
            <span className="font-medium text-marine-700">{route.mood}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-ink-soft/70">
              Подходит для
            </span>
            <span className="font-medium text-ink">{route.forWho}</span>
          </div>
        </div>

        {route.isMap && (
          <>
            <button
              ref={mapTriggerRef}
              type="button"
              onClick={() => setMapOpen(true)}
              className="mt-5 w-full rounded-full bg-marine-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-marine-700"
            >
              Открыть карту крупнее
            </button>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft/80">
              {mapDisclaimer}
            </p>
          </>
        )}

        <button
          type="button"
          onClick={() => scrollToBooking({ routeName: route.routeName })}
          className="mt-5 w-full rounded-full border border-marine-200 px-5 py-3 text-sm font-semibold text-marine-700 transition-colors hover:border-marine-500 hover:bg-marine-50"
        >
          Подобрать маршрут
        </button>
      </div>

      {mapOpen && <MapLightbox route={route} onClose={closeMap} />}
    </article>
  );
}

export function Routes() {
  return (
    <section id="routes" className="bg-milk py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Маршруты"
          title="Откройте Петербург с воды по-новому"
          subtitle="Красочные маршруты по островам, Неве и Финскому заливу — для свидания, компании, дня рождения, фотосессии или прогулки на закате."
        />

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <RouteCard key={route.title} route={route} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
