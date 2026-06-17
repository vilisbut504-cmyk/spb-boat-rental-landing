const steps = [
  {
    n: "01",
    title: "Оставьте заявку",
    text: "Выберите дату, время и повод. Напишите в мессенджер или позвоните нам.",
  },
  {
    n: "02",
    title: "Подберём катер",
    text: "Предложим катер под размер компании и маршрут, подтвердим свободный слот.",
  },
  {
    n: "03",
    title: "Внесёте предоплату",
    text: "Бронируем время выхода. Оставшуюся сумму оплачиваете в день прогулки.",
  },
  {
    n: "04",
    title: "Выходите на воду",
    text: "Приходите к причалу — капитан встречает вас и отправляется по маршруту.",
  },
];

export function Steps() {
  return (
    <section id="steps" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
            Как заказать
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Четыре простых шага
          </h2>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n}>
              <div className="text-5xl font-extrabold text-navy-100">
                {step.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-navy-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-800/70">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
