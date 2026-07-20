/**
 * Single source of truth for rental base prices and derived special tariffs.
 * Sexy Sea Red and Yellow Space: specialPrice = basePrice + SPECIAL_BOAT_SURCHARGE.
 * Certificate prices stay in data/certificates.ts (owner-confirmed, unchanged).
 */

export const SPECIAL_BOAT_SURCHARGE = 500;
export const FIFTH_PASSENGER_FEE = 1000;
export const CAPTAIN_HOURLY_FEE = 1000;

/** Boats that use base + SPECIAL_BOAT_SURCHARGE on every rental row */
export const SPECIAL_TARIFF_BOAT_NAMES = [
  "Sexy Sea Red",
  "Yellow Space",
] as const;

export type SpecialTariffBoatName = (typeof SPECIAL_TARIFF_BOAT_NAMES)[number];

export function isSpecialTariffBoat(name: string): boolean {
  return (SPECIAL_TARIFF_BOAT_NAMES as readonly string[]).includes(name);
}

export function formatRub(amount: number): string {
  return `${amount.toLocaleString("ru-RU").replace(/\u00a0/g, " ")} ₽`;
}

export type BaseTariffRow = {
  label: string;
  note?: string;
  /** Base price in ₽ before any boat surcharge */
  price: number;
};

export const baseTariffRows = {
  weekday: [
    { label: "60 минут", price: 4990 },
    { label: "90 минут", price: 7000 },
    { label: "120 минут", price: 9000 },
    { label: "180 минут", price: 12000 },
    { label: "Разводка мостов", note: "00:00–02:00", price: 10000 },
  ] satisfies BaseTariffRow[],
  weekend: [
    { label: "60 минут", price: 5990 },
    { label: "90 минут", price: 8000 },
    { label: "120 минут", price: 11000 },
    { label: "180 минут", price: 14000 },
    { label: "Разводка мостов", note: "00:00–02:00", price: 12000 },
  ] satisfies BaseTariffRow[],
} as const;

export const BASE_PRICE_FROM = baseTariffRows.weekday[0].price;
export const SPECIAL_PRICE_FROM = BASE_PRICE_FROM + SPECIAL_BOAT_SURCHARGE;

export function withSpecialSurcharge(basePrice: number): number {
  return basePrice + SPECIAL_BOAT_SURCHARGE;
}

export function specialTariffRows(
  dayType: keyof typeof baseTariffRows
): { label: string; note?: string; price: number; priceLabel: string }[] {
  return baseTariffRows[dayType].map((row) => {
    const price = withSpecialSurcharge(row.price);
    return {
      label: row.label,
      note: row.note,
      price,
      priceLabel: formatRub(price),
    };
  });
}

export const specialTariffNote =
  "Для катеров Sexy Sea Red и Yellow Space действует специальный тариф: к стоимости каждой прогулки прибавляется 500 ₽. Полный расчёт указан в карточках этих катеров.";

export const specialTariffCertificateNote =
  "При выборе Sexy Sea Red или Yellow Space к базовой стоимости прогулки применяется доплата 500 ₽.";

export const fifthPassengerNote =
  "Пятое место на 5-местном катере (Sexy Sea Red и Yellow Space) — доплата 1 000 ₽";

export const captainServiceShort =
  "Услуги капитана — 1 000 ₽/час. Возможность и формат сопровождения подтверждает менеджер.";

export const captainServiceNote =
  "Услуги капитана — 1 000 ₽/час. Возможность и формат сопровождения подтверждает менеджер. Капитан может сопровождать прогулку и обучать управлению катером в течение поездки, в том числе при прохождении под мостами.";
