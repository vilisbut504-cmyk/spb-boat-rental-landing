"use client";

import { useState } from "react";
import { site } from "@/data/site";

export function Booking() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="booking" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-600">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
                Бронирование
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Забронируйте прогулку
              </h2>
              <p className="mt-4 max-w-md text-white/70">
                Оставьте контакты — менеджер свяжется в течение 15 минут,
                подберёт катер и подтвердит свободное время.
              </p>
              <div className="mt-8 space-y-2 text-sm text-white/80">
                <p>
                  Телефон:{" "}
                  <a href={site.phoneHref} className="font-semibold text-gold-400">
                    {site.phone}
                  </a>
                </p>
                <p>{site.workHours}</p>
              </div>
            </div>

            {submitted ? (
              <div className="flex flex-col items-start justify-center rounded-2xl bg-white p-8">
                <div className="text-3xl">⚓</div>
                <h3 className="mt-4 text-xl font-bold text-navy-900">
                  Заявка отправлена
                </h3>
                <p className="mt-2 text-sm text-navy-800/70">
                  Спасибо! Мы свяжемся с вами в ближайшее время, чтобы
                  подтвердить детали прогулки.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="rounded-2xl bg-white p-6 sm:p-8"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-navy-900">
                      Имя
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Как к вам обращаться"
                      className="mt-1.5 w-full rounded-lg border border-navy-100 bg-navy-50/40 px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-navy-900">
                      Телефон
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      className="mt-1.5 w-full rounded-lg border border-navy-100 bg-navy-50/40 px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-navy-900">
                      Комментарий
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Дата, количество гостей, повод"
                      className="mt-1.5 w-full resize-none rounded-lg border border-navy-100 bg-navy-50/40 px-4 py-2.5 text-navy-900 outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-full bg-gold-500 px-6 py-3 font-semibold text-navy-900 transition-colors hover:bg-gold-400"
                >
                  Отправить заявку
                </button>
                <p className="mt-3 text-center text-xs text-navy-800/50">
                  Нажимая кнопку, вы соглашаетесь с политикой
                  конфиденциальности.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
