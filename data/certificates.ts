/**
 * Gift certificate tariffs — the single source of truth for the
 * /certificates page, the certificate form and /api/lead validation.
 *
 * Prices are owner-confirmed and mirror the rental tariffs.
 * The server always resolves the price from this file by id —
 * a price coming from the client is never trusted.
 */

export type CertificateDayType = "weekday" | "weekend";

export type CertificateTariff = {
  id: string;
  dayType: CertificateDayType;
  dayLabel: string;
  durationMinutes: number;
  durationLabel: string;
  /** Numeric price in ₽ — resolved server-side */
  price: number;
  /** Formatted price for display, e.g. "4 990 ₽" */
  priceLabel: string;
  /** Compact human label, e.g. "Пн–Чт · 2 часа — 9 000 ₽" */
  displayLabel: string;
};

const WEEKDAY_LABEL = "Понедельник — четверг";
const WEEKEND_LABEL = "Пятница — воскресенье";

function tariff(
  dayType: CertificateDayType,
  durationMinutes: number,
  durationLabel: string,
  price: number,
  priceLabel: string
): CertificateTariff {
  const dayShort = dayType === "weekday" ? "Пн–Чт" : "Пт–Вс";
  return {
    id: `${dayType}-${durationMinutes}`,
    dayType,
    dayLabel: dayType === "weekday" ? WEEKDAY_LABEL : WEEKEND_LABEL,
    durationMinutes,
    durationLabel,
    price,
    priceLabel,
    displayLabel: `${dayShort} · ${durationLabel} — ${priceLabel}`,
  };
}

export const certificateTariffs: CertificateTariff[] = [
  tariff("weekday", 60, "1 час", 4990, "4 990 ₽"),
  tariff("weekday", 90, "1,5 часа", 7000, "7 000 ₽"),
  tariff("weekday", 120, "2 часа", 9000, "9 000 ₽"),
  tariff("weekday", 180, "3 часа", 12000, "12 000 ₽"),
  tariff("weekend", 60, "1 час", 5990, "5 990 ₽"),
  tariff("weekend", 90, "1,5 часа", 8000, "8 000 ₽"),
  tariff("weekend", 120, "2 часа", 11000, "11 000 ₽"),
  tariff("weekend", 180, "3 часа", 14000, "14 000 ₽"),
];

export function getCertificateTariff(
  id: string
): CertificateTariff | undefined {
  return certificateTariffs.find((t) => t.id === id);
}

export const certificateFormatName = "Подарочный сертификат";

/** Preferred contact methods for the certificate form and API validation */
export const certificateContactMethods = [
  { id: "phone", label: "Телефонный звонок" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "max", label: "MAX" },
] as const;

export type CertificateContactMethodId =
  (typeof certificateContactMethods)[number]["id"];

export const certificateContactMethodIds = certificateContactMethods.map(
  (m) => m.id
) as string[];
