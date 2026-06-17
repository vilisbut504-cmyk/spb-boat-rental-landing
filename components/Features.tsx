const features = [
  {
    icon: "🧭",
    title: "Опытные капитаны",
    text: "Лицензированные судоводители со знанием каждого канала и графика развода мостов.",
  },
  {
    icon: "🛟",
    title: "Безопасность",
    text: "Исправные катера, спасательные жилеты и страховка. Регулярное техническое обслуживание флота.",
  },
  {
    icon: "🥂",
    title: "Под ваш повод",
    text: "Свидание, день рождения, корпоратив или фотосессия — подберём катер и сценарий прогулки.",
  },
  {
    icon: "⏱️",
    title: "Бронь за 5 минут",
    text: "Оставьте заявку — менеджер подтвердит свободный слот и пришлёт точку посадки.",
  },
];

export function Features() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
            Почему мы
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Спокойная прогулка без хлопот
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-navy-100 bg-navy-50/40 p-7 transition-shadow hover:shadow-md"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-5 text-lg font-semibold text-navy-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-800/70">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
