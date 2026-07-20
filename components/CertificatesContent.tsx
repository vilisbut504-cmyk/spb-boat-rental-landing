"use client";

import { useState } from "react";
import { site } from "@/data/site";
import {
  certificateTariffs,
  certificateContactMethods,
  certificateFormatName,
  getCertificateTariff,
  type CertificateDayType,
} from "@/data/certificates";
import { normalizeRuPhone, formatRuPhoneDisplay } from "@/lib/phone";
import {
  MaxIcon,
  PhoneIcon,
  TelegramIcon,
  VkIcon,
  WhatsAppIcon,
} from "@/components/SocialIcons";
import { CopyMaxNumber } from "@/components/CopyMaxNumber";

const orderSteps = [
  {
    n: "01",
    title: "Выберите сертификат",
    text: "Определите продолжительность прогулки и подходящую категорию дней.",
  },
  {
    n: "02",
    title: "Заполните короткую форму",
    text: "Укажите имя, телефон и удобный способ связи.",
  },
  {
    n: "03",
    title: "Получите подтверждение",
    text: "Менеджер свяжется с вами, подтвердит выбранный сертификат и отправит реквизиты для оплаты в личном сообщении.",
  },
  {
    n: "04",
    title: "Оплатите сертификат",
    text: "После подтверждения переведите согласованную сумму по полученным реквизитам.",
  },
];

type Fields = {
  name: string;
  phone: string;
  preferredContact: string;
  telegramUsername: string;
  comment: string;
  agreePrivacy: boolean;
  agreeCertificate: boolean;
};

const initialFields: Fields = {
  name: "",
  phone: "",
  preferredContact: "",
  telegramUsername: "",
  comment: "",
  agreePrivacy: false,
  agreeCertificate: false,
};

type FieldErrors = Partial<Record<keyof Fields | "tariff", string>>;

function validate(fields: Fields, tariffId: string): FieldErrors {
  const e: FieldErrors = {};
  if (fields.name.trim().length < 2) e.name = "Укажите имя";
  const phone = normalizeRuPhone(fields.phone);
  if (!phone.ok) e.phone = phone.error;
  if (!tariffId) e.tariff = "Выберите сертификат";
  if (!fields.preferredContact) e.preferredContact = "Выберите способ связи";
  if (
    fields.preferredContact === "telegram" &&
    !fields.telegramUsername.trim()
  ) {
    e.telegramUsername = "Укажите имя пользователя в Telegram";
  }
  if (!fields.agreePrivacy) e.agreePrivacy = "Необходимо согласие";
  if (!fields.agreeCertificate) e.agreeCertificate = "Необходимо согласие";
  return e;
}

function TariffPanel({
  dayType,
  title,
  selectedId,
  onSelect,
}: {
  dayType: CertificateDayType;
  title: string;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const rows = certificateTariffs.filter((t) => t.dayType === dayType);
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-marine-100 bg-milk">
      <div
        className={`px-6 py-5 sm:px-8 ${
          dayType === "weekday" ? "bg-marine-600" : "bg-marine-700"
        }`}
      >
        <h3 className="text-lg font-bold text-white sm:text-xl">{title}</h3>
      </div>
      <ul className="flex-1 divide-y divide-marine-100">
        {rows.map((t) => {
          const selected = t.id === selectedId;
          return (
            <li
              key={t.id}
              className={`flex items-center justify-between gap-3 px-5 py-4 transition-colors sm:px-6 ${
                selected ? "bg-sea-500/10" : ""
              }`}
            >
              <span className="min-w-0 font-medium text-ink">
                {t.durationLabel}
              </span>
              <span
                aria-hidden="true"
                className="hidden flex-1 border-b border-dotted border-marine-200 sm:block"
              />
              <span className="shrink-0 text-base font-bold text-marine-700 sm:text-lg">
                {t.priceLabel}
              </span>
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                aria-pressed={selected}
                aria-label={`Выбрать сертификат: ${t.displayLabel}`}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:px-5 sm:py-2 sm:text-sm ${
                  selected
                    ? "bg-marine-600 text-white"
                    : "border border-marine-200 text-marine-700 hover:border-marine-500 hover:bg-marine-50"
                }`}
              >
                {selected ? "Выбрано" : "Выбрать"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CertificatesContent() {
  const [selectedTariffId, setSelectedTariffId] = useState("");
  const [fields, setFields] = useState<Fields>(initialFields);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const selectedTariff = getCertificateTariff(selectedTariffId);

  const selectTariff = (id: string) => {
    setSelectedTariffId(id);
    setErrors((prev) => ({ ...prev, tariff: undefined }));
    document
      .getElementById("certificate-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const update = (key: keyof Fields, value: string | boolean) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
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
    const e = validate(fields, selectedTariffId);
    setErrors(e);
    if (Object.keys(e).some((k) => e[k as keyof FieldErrors])) return;

    const phone = normalizeRuPhone(fields.phone);
    if (!phone.ok) return;

    setSubmitting(true);
    setServerMessage("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadType: "gift_certificate",
          format: certificateFormatName,
          name: fields.name,
          phone: phone.canonical,
          certificateTariffId: selectedTariffId,
          preferredContact: fields.preferredContact,
          telegramUsername:
            fields.preferredContact === "telegram"
              ? fields.telegramUsername.trim()
              : "",
          comment: fields.comment,
          privacyConsent: fields.agreePrivacy,
          certificateConsent: fields.agreeCertificate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerMessage(data.error ?? "Ошибка отправки");
        return;
      }
      setServerMessage(data.message ?? "");
      setTestMode(Boolean(data.testMode));
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

  return (
    <>
      {/* Tariff panels */}
      <section className="bg-white py-16 sm:py-20" id="certificate-tariffs">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sea-500">
              Тарифы сертификатов
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Выберите продолжительность прогулки
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Стоимость зависит от категории дней. После выбора страница
              перейдёт к короткой форме заявки.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-marine-800">
              При выборе Sexy Sea Red или Yellow Space к базовой стоимости
              прогулки применяется доплата 500 ₽.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <TariffPanel
              dayType="weekday"
              title="Понедельник — четверг"
              selectedId={selectedTariffId}
              onSelect={selectTariff}
            />
            <TariffPanel
              dayType="weekend"
              title="Пятница — воскресенье"
              selectedId={selectedTariffId}
              onSelect={selectTariff}
            />
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="bg-milk py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sea-500">
              Как заказать
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Как заказать сертификат
            </h2>
          </div>

          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {orderSteps.map((step) => (
              <li
                key={step.n}
                className="rounded-2xl border border-marine-100 bg-white p-6"
              >
                <span className="text-3xl font-extrabold text-marine-200">
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-semibold leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-8 rounded-2xl border border-marine-100 bg-white px-6 py-5 text-sm leading-relaxed text-ink-soft">
            Дата, время прогулки, катер и маршрут согласовываются с менеджером
            отдельно.
          </p>
        </div>
      </section>

      {/* Certificate form. id="booking" keeps the header CTA working on this page. */}
      <section id="booking" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8" id="certificate-form">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sea-500">
              Заявка
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Заявка на сертификат
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Заполните короткую форму — менеджер свяжется с вами выбранным
              способом.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-marine-100 bg-milk p-6 shadow-sm sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center py-6 text-center">
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
                  {testMode
                    ? "Приём заявок настраивается"
                    : "Заявка отправлена"}
                </h3>
                <p
                  className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft"
                  aria-live="polite"
                >
                  {serverMessage}
                </p>

                {testMode && (
                  <div className="mt-6 w-full max-w-md rounded-2xl border border-marine-100 bg-white p-5 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      Связаться с нами напрямую
                    </p>
                    <ul className="mt-3 space-y-2.5 text-sm">
                      <li>
                        <a
                          href={site.phoneHref}
                          className="inline-flex items-center gap-2 font-medium text-marine-700 hover:text-marine-600"
                        >
                          <PhoneIcon className="h-4 w-4" />
                          Позвонить · {site.phoneDisplay}
                        </a>
                      </li>
                      <li>
                        <a
                          href={site.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-marine-700 hover:text-marine-600"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                          WhatsApp · {site.whatsappDisplay}
                        </a>
                      </li>
                      <li>
                        <a
                          href={site.telegramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-marine-700 hover:text-marine-600"
                        >
                          <TelegramIcon className="h-4 w-4" />
                          Telegram · {site.telegramUsername}
                        </a>
                      </li>
                      <li>
                        <a
                          href={site.vkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-marine-700 hover:text-marine-600"
                        >
                          <VkIcon className="h-4 w-4" />
                          Мы ВКонтакте
                        </a>
                      </li>
                      <li className="flex flex-wrap items-center gap-2 text-ink-soft">
                        <MaxIcon className="h-4 w-4" />
                        MAX · {site.maxDisplay}
                        <CopyMaxNumber
                          number={site.maxCanonical}
                          className="rounded-full border border-marine-200 px-3 py-1 text-xs font-semibold text-marine-700 transition-colors hover:border-marine-500 hover:bg-marine-50"
                        />
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                {serverMessage && (
                  <p
                    className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
                    aria-live="polite"
                  >
                    {serverMessage}
                  </p>
                )}

                {/* Selected certificate */}
                <div
                  className={`rounded-2xl border px-5 py-4 ${
                    errors.tariff
                      ? "border-red-400 bg-red-50"
                      : "border-marine-100 bg-white"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    Выбранный сертификат
                  </p>
                  {selectedTariff ? (
                    <p className="mt-1.5 font-semibold text-ink">
                      {selectedTariff.dayLabel} · {selectedTariff.durationLabel}
                      <span className="ml-2 text-marine-700">
                        {selectedTariff.priceLabel}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1.5 text-sm text-ink-soft">
                      Сертификат ещё не выбран — выберите вариант в тарифах
                      выше или в списке ниже.
                    </p>
                  )}
                  <label className="mt-3 block">
                    <span className="text-sm font-medium text-ink">
                      {selectedTariff ? "Изменить выбор" : "Выбрать из списка"}
                    </span>
                    <select
                      value={selectedTariffId}
                      onChange={(e) => {
                        setSelectedTariffId(e.target.value);
                        setErrors((prev) => ({ ...prev, tariff: undefined }));
                      }}
                      className="mt-1.5 w-full rounded-xl border border-marine-100 bg-white px-4 py-2.5 text-ink outline-none transition-colors focus:border-marine-500"
                    >
                      <option value="">Выберите сертификат</option>
                      {certificateTariffs.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.displayLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                  {errors.tariff && (
                    <p className="mt-2 text-xs text-red-500">{errors.tariff}</p>
                  )}
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-ink">
                      Имя покупателя
                    </span>
                    <input
                      type="text"
                      value={fields.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Как к вам обращаться"
                      className={fieldClass("name")}
                    />
                    {errors.name && (
                      <span className="mt-1 block text-xs text-red-500">
                        {errors.name}
                      </span>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-ink">
                      Телефон
                    </span>
                    <input
                      type="tel"
                      value={fields.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      onBlur={onPhoneBlur}
                      placeholder="+7 (___) ___-__-__"
                      className={fieldClass("phone")}
                    />
                    {errors.phone && (
                      <span className="mt-1 block text-xs text-red-500">
                        {errors.phone}
                      </span>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-ink">
                      Предпочтительный способ связи
                    </span>
                    <select
                      value={fields.preferredContact}
                      onChange={(e) =>
                        update("preferredContact", e.target.value)
                      }
                      className={fieldClass("preferredContact")}
                    >
                      <option value="">Выберите способ связи</option>
                      {certificateContactMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    {errors.preferredContact && (
                      <span className="mt-1 block text-xs text-red-500">
                        {errors.preferredContact}
                      </span>
                    )}
                  </label>

                  {fields.preferredContact === "telegram" && (
                    <label className="block">
                      <span className="text-sm font-medium text-ink">
                        Имя пользователя в Telegram
                      </span>
                      <input
                        type="text"
                        value={fields.telegramUsername}
                        onChange={(e) =>
                          update("telegramUsername", e.target.value)
                        }
                        placeholder="@username"
                        className={fieldClass("telegramUsername")}
                      />
                      {errors.telegramUsername && (
                        <span className="mt-1 block text-xs text-red-500">
                          {errors.telegramUsername}
                        </span>
                      )}
                    </label>
                  )}
                </div>

                <div className="mt-5">
                  <label className="block">
                    <span className="text-sm font-medium text-ink">
                      Комментарий
                    </span>
                    <textarea
                      rows={3}
                      value={fields.comment}
                      onChange={(e) => update("comment", e.target.value)}
                      placeholder="Пожелания к сертификату (необязательно)"
                      className={`${fieldClass("comment")} resize-none`}
                    />
                  </label>
                </div>

                <div className="mt-6 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={fields.agreePrivacy}
                      onChange={(e) => update("agreePrivacy", e.target.checked)}
                      className="mt-0.5 h-5 w-5 flex-none accent-marine-600"
                    />
                    <span className="text-sm text-ink-soft">
                      Согласие на обработку персональных данных
                      {errors.agreePrivacy && (
                        <span className="ml-2 text-xs text-red-500">
                          {errors.agreePrivacy}
                        </span>
                      )}
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={fields.agreeCertificate}
                      onChange={(e) =>
                        update("agreeCertificate", e.target.checked)
                      }
                      className="mt-0.5 h-5 w-5 flex-none accent-marine-600"
                    />
                    <span className="text-sm text-ink-soft">
                      Согласие с условиями оформления сертификата
                      {errors.agreeCertificate && (
                        <span className="ml-2 text-xs text-red-500">
                          {errors.agreeCertificate}
                        </span>
                      )}
                    </span>
                  </label>
                </div>

                <div className="mt-6 rounded-xl border border-marine-100 bg-marine-50 px-4 py-3.5 text-sm leading-relaxed text-ink-soft">
                  После заявки менеджер подтвердит выбранный сертификат и
                  отправит реквизиты для оплаты в личном сообщении.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-7 w-full rounded-full bg-marine-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-marine-700 disabled:opacity-60"
                >
                  {submitting ? "Отправка…" : "Отправить заявку на сертификат"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-milk px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-marine-700 via-marine-600 to-sea-500 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Остались вопросы о сертификатах?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/80">
            Напишите или позвоните — поможем выбрать продолжительность и
            расскажем, как проходит прогулка.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={site.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={site.telegramAriaLabel}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-marine-700 transition-colors hover:bg-marine-50 sm:w-auto"
            >
              <TelegramIcon className="h-4 w-4" />
              Написать в Telegram
            </a>
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={site.whatsappAriaLabel}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Написать в WhatsApp
            </a>
            <a
              href={site.phoneHref}
              aria-label={site.phoneAriaLabel}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              <PhoneIcon className="h-4 w-4" />
              Позвонить
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
