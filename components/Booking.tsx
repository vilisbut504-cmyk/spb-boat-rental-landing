"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { useBooking } from "@/components/BookingProvider";
import { boats } from "@/data/boats";
import {
  prepaymentNote,
  certificateFormatName,
  certificates,
} from "@/data/content";
import { routeNames } from "@/data/routes";
import { normalizeRuPhone, formatRuPhoneDisplay } from "@/lib/phone";

type Fields = {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  boatName: string;
  route: string;
  format: string;
  certificateAmount: string;
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
  boatName: "",
  route: "",
  format: "",
  certificateAmount: "",
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
  "Разводные мосты",
  "Просто прогулка",
  certificateFormatName,
];

/** No boat selected yet → allow the largest fleet capacity */
const DEFAULT_MAX_GUESTS = 5;

function maxGuestsFor(boatName: string): number {
  const boat = boats.find((b) => b.name === boatName);
  return boat?.maxGuests ?? DEFAULT_MAX_GUESTS;
}

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (f.name.trim().length < 2) e.name = "Укажите имя";
  const phone = normalizeRuPhone(f.phone);
  if (!phone.ok) e.phone = phone.error;
  if (!f.date) e.date = "Выберите дату";
  if (!f.time) e.time = "Выберите время";
  const maxGuests = maxGuestsFor(f.boatName);
  const guestsNum = Number(f.guests);
  if (!f.guests || guestsNum < 1) {
    e.guests = "Сколько человек?";
  } else if (guestsNum > maxGuests) {
    e.guests = `Для выбранного катера — до ${maxGuests} человек`;
  }
  if (!f.format) e.format = "Выберите формат";
  if (f.format === certificateFormatName && !f.certificateAmount) {
    e.certificateAmount = "Выберите номинал";
  }
  if (!f.agreePrivacy) e.agreePrivacy = "Необходимо согласие";
  if (!f.agreeRules) e.agreeRules = "Необходимо согласие";
  return e;
}

export function Booking() {
  const {
    selectedBoat,
    selectedRoute,
    selectedCertificate,
    setSelectedBoat,
    setSelectedRoute,
    setSelectedCertificate,
  } = useBooking();
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof Fields, string>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [testModeNote, setTestModeNote] = useState("");
  const [guestNotice, setGuestNotice] = useState("");

  // Sync boat/route chosen from Fleet/Routes into the form without resetting other fields.
  useEffect(() => {
    if (selectedBoat) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional BookingProvider → form sync
      setFields((prev) => ({ ...prev, boatName: selectedBoat }));
    }
  }, [selectedBoat]);

  useEffect(() => {
    if (selectedRoute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional BookingProvider → form sync
      setFields((prev) => ({ ...prev, route: selectedRoute }));
    }
  }, [selectedRoute]);

  // Gift certificate chosen in the Certificates section → switch format + amount only.
  useEffect(() => {
    if (selectedCertificate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional BookingProvider → form sync
      setFields((prev) => ({
        ...prev,
        format: certificateFormatName,
        certificateAmount: selectedCertificate,
      }));
    }
  }, [selectedCertificate]);

  const update = (key: keyof Fields, value: string | boolean) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value } as Fields;
      // Boat switched to a smaller one → clamp guests, keep everything else.
      if (key === "boatName" && typeof value === "string") {
        const max = maxGuestsFor(value);
        if (next.guests && Number(next.guests) > max) {
          next.guests = String(max);
          setGuestNotice(
            `Для выбранного катера количество гостей изменено на ${max}.`
          );
        } else {
          setGuestNotice("");
        }
      }
      if (key === "guests") setGuestNotice("");
      // Regular walk format → certificate amount must be empty.
      if (
        key === "format" &&
        typeof value === "string" &&
        value !== certificateFormatName
      ) {
        next.certificateAmount = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === "boatName" && typeof value === "string") {
      setSelectedBoat(value);
    }
    if (key === "route" && typeof value === "string") {
      setSelectedRoute(value);
    }
    if (key === "certificateAmount" && typeof value === "string") {
      setSelectedCertificate(value);
    }
  };

  const onPhoneBlur = () => {
    const result = normalizeRuPhone(fields.phone);
    if (result.ok) {
      setFields((prev) => ({
        ...prev,
        phone: formatRuPhoneDisplay(result.canonical),
      }));
    }
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(fields);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const normalizedPhone = normalizeRuPhone(fields.phone);
    if (!normalizedPhone.ok) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          phone: normalizedPhone.canonical,
          date: fields.date,
          time: fields.time,
          people: fields.guests,
          guests: fields.guests,
          boatName: fields.boatName,
          routeName: fields.route,
          format: fields.format,
          certificateAmount:
            fields.format === certificateFormatName
              ? fields.certificateAmount
              : "",
          comment: fields.comment,
          prepaymentNote,
          privacyAccepted: fields.agreePrivacy,
          rulesAccepted: fields.agreeRules,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerMessage(data.error ?? "Ошибка отправки");
        return;
      }
      setServerMessage(data.message ?? "");
      setTestModeNote(data.testModeNote ?? "");
      setSubmitted(true);
    } catch {
      setServerMessage("Не удалось отправить заявку. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (key: keyof Fields) =>
    `mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-ink outline-none transition-colors focus:border-marine-500 ${
      errors[key] ? "border-red-400" : "border-marine-100"
    }`;

  const resetForm = () => {
    setFields(initial);
    setSelectedBoat("");
    setSelectedRoute("");
    setSelectedCertificate("");
    setSubmitted(false);
    setServerMessage("");
    setTestModeNote("");
    setGuestNotice("");
  };

  const maxGuests = maxGuestsFor(fields.boatName);
  const guestOptions = Array.from({ length: maxGuests }, (_, i) =>
    String(i + 1)
  );

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
                {serverMessage ||
                  "Заявка принята. Менеджер свяжется с вами, подтвердит катер, маршрут и свободное время, а также подскажет способ внесения предоплаты 1 000 ₽ в счёт прогулки."}
              </p>
              {testModeNote && (
                <p className="mt-2 max-w-md text-xs text-ink-soft/70">
                  {testModeNote}
                </p>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="mt-6 text-sm font-semibold text-marine-600 hover:text-marine-700"
              >
                Отправить ещё одну заявку
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              {serverMessage && !submitted && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {serverMessage}
                </p>
              )}

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
                    onBlur={onPhoneBlur}
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
                  <select
                    value={fields.guests}
                    onChange={(e) => update("guests", e.target.value)}
                    className={fieldClass("guests")}
                  >
                    <option value="">Выберите количество</option>
                    {guestOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {guestNotice ? (
                    <span
                      className="mt-1 block text-xs text-marine-700"
                      role="status"
                    >
                      {guestNotice}
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs text-ink-soft/70">
                      {fields.boatName
                        ? `Для этого катера — от 1 до ${maxGuests} человек`
                        : "Вместимость зависит от выбранного катера: до 4 или до 5 человек"}
                    </span>
                  )}
                </Field>

                <Field label="Выбранный катер" error={undefined}>
                  <select
                    value={fields.boatName}
                    onChange={(e) => update("boatName", e.target.value)}
                    className={fieldClass("boatName")}
                  >
                    <option value="">Не выбран — подберём вместе</option>
                    {boats
                      .filter((b) => b.bookable)
                      .map((b) => (
                        <option key={b.slug} value={b.name}>
                          {b.name}
                          {b.shortName ? ` · ${b.shortName}` : ""}
                        </option>
                      ))}
                  </select>
                </Field>

                <Field label="Желаемый маршрут" error={undefined}>
                  <select
                    value={fields.route}
                    onChange={(e) => update("route", e.target.value)}
                    className={fieldClass("route")}
                  >
                    <option value="">Выберите маршрут</option>
                    {routeNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
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

                {fields.format === certificateFormatName && (
                  <Field
                    label="Номинал сертификата"
                    error={errors.certificateAmount}
                  >
                    <select
                      value={fields.certificateAmount}
                      onChange={(e) =>
                        update("certificateAmount", e.target.value)
                      }
                      className={fieldClass("certificateAmount")}
                    >
                      <option value="">Выберите номинал</option>
                      {certificates.map((c) => (
                        <option key={c.amount} value={String(c.amount)}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
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
                  label="Согласие с правилами аренды"
                />
              </div>

              <div className="mt-6 rounded-xl border border-marine-100 bg-marine-50 px-4 py-3.5 text-sm leading-relaxed text-ink-soft">
                Бронь подтверждается после предоплаты 1 000 ₽. Сумма входит в
                стоимость прогулки. Способ внесения предоплаты подскажет
                менеджер.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-7 w-full rounded-full bg-marine-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-marine-700 disabled:opacity-60"
              >
                {submitting ? "Отправка…" : "Получить варианты"}
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
      {error && (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      )}
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
