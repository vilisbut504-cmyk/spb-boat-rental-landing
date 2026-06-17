"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";

type Fields = {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  format: string;
  comment: string;
  agreePrivacy: boolean;
  agreeRules: boolean;
};

const initial: Fields = {
  name: "",
  phone: "",
  date: "",
  time: "",
  guests: "",
  format: "",
  comment: "",
  agreePrivacy: false,
  agreeRules: false,
};

const formatOptions = [
  "Свидание",
  "Друзья",
  "День рождения",
  "Семья",
  "Фотосессия",
  "Просто прогулка",
];

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (f.name.trim().length < 2) e.name = "Укажите имя";
  const phoneDigits = f.phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) e.phone = "Укажите корректный телефон";
  if (!f.date) e.date = "Выберите дату";
  if (!f.time) e.time = "Выберите время";
  if (!f.guests || Number(f.guests) < 1) e.guests = "Сколько человек?";
  if (!f.format) e.format = "Выберите формат";
  if (!f.agreePrivacy) e.agreePrivacy = "Необходимо согласие";
  if (!f.agreeRules) e.agreeRules = "Необходимо согласие";
  return e;
}

export function Booking() {
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof Fields, string>>
  >({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof Fields, value: string | boolean) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(fields);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setSubmitted(true);
    }
  };

  const fieldClass = (key: keyof Fields) =>
    `mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-ink outline-none transition-colors focus:border-marine-500 ${
      errors[key] ? "border-red-400" : "border-marine-100"
    }`;

  return (
    <section id="booking" className="bg-milk py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Бронирование"
          title="Подберём катер и маршрут под вашу прогулку"
          subtitle="Оставьте заявку — менеджер свяжется, уточнит детали и предложит варианты."
          center
        />

        <div className="mt-10 rounded-3xl border border-marine-100 bg-white p-6 shadow-sm sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-marine-50 text-marine-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-bold text-ink">
                Заявка принята
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                Заявка принята в тестовом режиме. Для боевого запуска подключите
                Telegram, CRM или почту в API-обработчике.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFields(initial);
                  setSubmitted(false);
                }}
                className="mt-6 text-sm font-semibold text-marine-600 hover:text-marine-700"
              >
                Отправить ещё одну заявку
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Имя" error={errors.name}>
                  <input
                    type="text"
                    value={fields.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Как к вам обращаться"
                    className={fieldClass("name")}
                  />
                </Field>

                <Field label="Телефон" error={errors.phone}>
                  <input
                    type="tel"
                    value={fields.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    className={fieldClass("phone")}
                  />
                </Field>

                <Field label="Желаемая дата" error={errors.date}>
                  <input
                    type="date"
                    value={fields.date}
                    onChange={(e) => update("date", e.target.value)}
                    className={fieldClass("date")}
                  />
                </Field>

                <Field label="Желаемое время" error={errors.time}>
                  <input
                    type="time"
                    value={fields.time}
                    onChange={(e) => update("time", e.target.value)}
                    className={fieldClass("time")}
                  />
                </Field>

                <Field label="Количество человек" error={errors.guests}>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={fields.guests}
                    onChange={(e) => update("guests", e.target.value)}
                    placeholder="Например, 4"
                    className={fieldClass("guests")}
                  />
                </Field>

                <Field label="Формат прогулки" error={errors.format}>
                  <select
                    value={fields.format}
                    onChange={(e) => update("format", e.target.value)}
                    className={fieldClass("format")}
                  >
                    <option value="" disabled>
                      Выберите формат
                    </option>
                    {formatOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Комментарий" error={undefined}>
                  <textarea
                    rows={3}
                    value={fields.comment}
                    onChange={(e) => update("comment", e.target.value)}
                    placeholder="Пожелания по маршруту, поводу, времени"
                    className={`${fieldClass("comment")} resize-none`}
                  />
                </Field>
              </div>

              <div className="mt-6 space-y-3">
                <Checkbox
                  checked={fields.agreePrivacy}
                  onChange={(v) => update("agreePrivacy", v)}
                  error={errors.agreePrivacy}
                  label="Согласие на обработку персональных данных"
                />
                <Checkbox
                  checked={fields.agreeRules}
                  onChange={(v) => update("agreeRules", v)}
                  error={errors.agreeRules}
                  label="Согласие с условиями аренды"
                />
              </div>

              <button
                type="submit"
                className="mt-7 w-full rounded-full bg-marine-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-marine-700"
              >
                Получить варианты
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  error?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 flex-none accent-marine-600"
      />
      <span className="text-sm text-ink-soft">
        {label}
        {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
      </span>
    </label>
  );
}
