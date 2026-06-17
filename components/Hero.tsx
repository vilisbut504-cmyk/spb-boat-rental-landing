import { site } from "@/data/site";

const stats = [
  { value: "9 лет", label: "на воде" },
  { value: "12 000+", label: "гостей" },
  { value: "4.9", label: "рейтинг" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-navy-900">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(216,178,94,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(31,111,178,0.4), transparent 45%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 18px, rgba(255,255,255,0.08) 18px 20px)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-28 pb-16 sm:px-8">
        <p className="animate-float-up text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
          Санкт-Петербург · прогулки по воде
        </p>
        <h1
          className="animate-float-up mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl"
          style={{ animationDelay: "0.1s" }}
        >
          Аренда катеров <span className="text-gold-400">с капитаном</span> по
          Неве и каналам
        </h1>
        <p
          className="animate-float-up mt-6 max-w-xl text-lg leading-relaxed text-white/70"
          style={{ animationDelay: "0.2s" }}
        >
          Закрытая прогулка только для вашей компании. Развод мостов, белые
          ночи и закат над заливом — выберите момент, остальное мы возьмём на
          себя.
        </p>

        <div
          className="animate-float-up mt-9 flex flex-col gap-4 sm:flex-row"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            href="#booking"
            className="rounded-full bg-gold-500 px-8 py-3.5 text-center font-semibold text-navy-900 transition-colors hover:bg-gold-400"
          >
            Забронировать прогулку
          </a>
          <a
            href={site.phoneHref}
            className="rounded-full border border-white/30 px-8 py-3.5 text-center font-semibold text-white transition-colors hover:bg-white/10"
          >
            {site.phone}
          </a>
        </div>

        <div
          className="animate-float-up mt-16 flex max-w-md gap-10"
          style={{ animationDelay: "0.4s" }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="mt-1 text-sm text-white/50">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
