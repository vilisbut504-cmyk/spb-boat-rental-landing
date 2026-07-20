import Image from "next/image";
import { site } from "@/data/site";
import { heroBadges, heroRealPhotos } from "@/data/content";

/**
 * Static chessboard of four real photos — not a carousel.
 * Visual order: top [2][4], bottom [1][3]. File order remains 1→2→3→4.
 */
const mosaicSlots = [
  { photo: heroRealPhotos[1], grid: "col-start-1 row-start-1" },
  { photo: heroRealPhotos[3], grid: "col-start-2 row-start-1" },
  { photo: heroRealPhotos[0], grid: "col-start-1 row-start-2" },
  { photo: heroRealPhotos[2], grid: "col-start-2 row-start-2" },
] as const;

function HeroPhotoCard({
  photo,
  priority,
  className,
}: {
  photo: (typeof heroRealPhotos)[number];
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-[0_18px_40px_-20px_rgba(12,58,90,0.45)] ring-1 ring-white/70 max-[360px]:rounded-xl ${photo.bgClass} ${className ?? ""}`}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className={
          photo.fit === "contain" ? "object-contain" : "object-cover"
        }
        style={{ objectPosition: photo.objectPosition }}
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 1024px) 45vw, 22vw"
      />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-milk pt-28 pb-14 sm:pt-32 lg:pb-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 80% 0%, rgba(47,166,184,0.14), transparent 70%), radial-gradient(50% 40% at 0% 20%, rgba(31,122,168,0.10), transparent 70%)",
        }}
      />
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-mist"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0 60 C 240 110 480 110 720 70 C 960 30 1200 30 1440 70 L1440 120 L0 120 Z" />
        <path
          d="M0 86 C 240 120 520 120 720 96 C 960 68 1200 78 1440 96 L1440 120 L0 120 Z"
          opacity="0.6"
        />
      </svg>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <span className="animate-float-up inline-flex items-center gap-2 rounded-full border border-marine-100 bg-white px-4 py-1.5 text-xs font-semibold text-marine-600">
            <span className="h-1.5 w-1.5 rounded-full bg-sea-400" />
            {site.city} · самостоятельные прогулки
          </span>

          <h1
            className="animate-float-up mt-5 text-[1.85rem] font-extrabold leading-[1.12] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
            style={{ animationDelay: "0.05s" }}
          >
            Аренда катера без капитана и без прав в Санкт-Петербурге
          </h1>

          <p
            className="animate-float-up mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg"
            style={{ animationDelay: "0.12s" }}
          >
            Самостоятельные прогулки по Финскому заливу, Неве, рекам и каналам
            Санкт-Петербурга. Вы сами управляете катером без специальных прав —
            легально, после подробного инструктажа перед выходом на воду.
          </p>

          <p
            className="animate-float-up mt-4 text-sm font-medium text-marine-700"
            style={{ animationDelay: "0.16s" }}
          >
            Катера до 5 человек · от 4 990 ₽ · бесплатный инструктаж · бронь
            1 000 ₽ в счёт прогулки
          </p>

          <div
            className="animate-float-up mt-7 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "0.2s" }}
          >
            <a
              href="#booking"
              className="rounded-full bg-marine-600 px-7 py-3.5 text-center font-semibold text-white shadow-sm transition-colors hover:bg-marine-700"
            >
              Забронировать катер
            </a>
            <a
              href="#boats"
              className="rounded-full border border-marine-200 bg-white px-7 py-3.5 text-center font-semibold text-marine-700 transition-colors hover:border-marine-500"
            >
              Выбрать катер
            </a>
          </div>

          <ul
            className="animate-float-up mt-7 flex flex-wrap gap-2"
            style={{ animationDelay: "0.28s" }}
          >
            {heroBadges.map((b) => (
              <li
                key={b}
                className="rounded-full bg-mist px-3.5 py-1.5 text-sm font-medium text-marine-700"
              >
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="animate-float-up relative mx-auto w-full max-w-md lg:max-w-none"
          style={{ animationDelay: "0.18s" }}
        >
          {/* Soft route / wave line behind the mosaic — stays under faces */}
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full text-sea-400/35"
            viewBox="0 0 400 480"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M40 300 C 90 220, 140 180, 200 200 S 310 280, 360 160"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 8"
            />
            <path
              d="M30 340 C 120 300, 180 360, 250 320 S 340 280, 380 300"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.55"
              strokeLinecap="round"
            />
          </svg>

          <div className="relative z-10 grid grid-cols-2 gap-2.5 max-[360px]:gap-2 sm:gap-3.5">
            {mosaicSlots.map(({ photo, grid }, i) => {
              const isPhoto1 = photo.src === heroRealPhotos[0].src;
              const raiseCol2 = i === 1 || i === 3;
              return (
                <HeroPhotoCard
                  key={photo.src}
                  photo={photo}
                  priority={isPhoto1}
                  className={`${grid} ${
                    raiseCol2
                      ? "-mt-4 sm:-mt-5 lg:-mt-6"
                      : "mt-4 sm:mt-5 lg:mt-6"
                  }`}
                />
              );
            })}
          </div>

          <div className="animate-helm-glow absolute -bottom-3 left-2 z-20 rounded-2xl border border-marine-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:-bottom-4 sm:left-0 sm:px-5 sm:py-4">
            <div className="text-base font-extrabold leading-tight text-marine-700 sm:text-xl">
              Ты сам
            </div>
            <div className="text-sm font-semibold text-sea-500">
              за штурвалом
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
