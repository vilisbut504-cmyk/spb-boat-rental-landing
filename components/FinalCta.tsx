export function FinalCta() {
  return (
    <section className="bg-milk px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-marine-700 via-marine-600 to-sea-500 px-6 py-14 text-center sm:px-12 sm:py-20">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Готовы выйти на воду?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
          Оставьте заявку — подберём катер, время и маршрут для вашей прогулки по
          Петербургу.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#booking"
            className="w-full rounded-full bg-white px-7 py-3.5 font-semibold text-marine-700 transition-colors hover:bg-marine-50 sm:w-auto"
          >
            Забронировать катер
          </a>
          <a
            href="#booking"
            className="w-full rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Написать в Telegram
          </a>
          <a
            href="#booking"
            className="w-full rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Позвонить
          </a>
        </div>
      </div>
    </section>
  );
}
