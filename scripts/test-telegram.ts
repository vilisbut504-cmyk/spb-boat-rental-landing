/**
 * Lightweight checks for Telegram lead message building (no network, no secrets).
 * Run: npm run test:telegram
 */

import assert from "node:assert/strict";
import {
  buildLeadTelegramText,
  sanitizeTelegramPlainText,
} from "../lib/telegram.ts";
import type { AmoCrmLeadInput } from "../lib/amocrm.ts";

function assertNoEmptyLabeledLines(text: string) {
  for (const line of text.split("\n")) {
    assert.doesNotMatch(line, /:\s*$/, `empty labeled line: ${JSON.stringify(line)}`);
  }
}

const boatMinimal: AmoCrmLeadInput = {
  kind: "boat_rental",
  name: "Иван",
  phone: "+79001234567",
  receivedAt: "2026-07-24T12:00:00.000Z",
};

const boatFull: AmoCrmLeadInput = {
  kind: "boat_rental",
  name: "Иван",
  phone: "+79001234567",
  boatName: "Total Black",
  routeName: "Нева",
  date: "2026-08-01",
  time: "18:00",
  guests: "4",
  format: "Прогулка",
  comment: "Нужен инструктаж",
  receivedAt: "2026-07-24T12:00:00.000Z",
};

const cert: AmoCrmLeadInput = {
  kind: "gift_certificate",
  name: "Мария",
  phone: "+79007654321",
  certificateDisplayLabel: "Будни · 60 мин",
  certificateDayLabel: "Будни",
  certificateDurationLabel: "60 минут",
  certificatePriceLabel: "4 990 ₽",
  preferredContactLabel: "Telegram",
  telegramUsername: "@maria",
  comment: "",
  receivedAt: "2026-07-24T12:00:00.000Z",
};

const minimalText = buildLeadTelegramText(boatMinimal);
assert.match(minimalText, /Тип заявки: Аренда катера/);
assert.match(minimalText, /Клиент: Иван/);
assert.match(minimalText, /Телефон: \+79001234567/);
assert.doesNotMatch(minimalText, /Катер:/);
assert.doesNotMatch(minimalText, /Дата:/);
assert.doesNotMatch(minimalText, /Время:/);
assert.doesNotMatch(minimalText, /Маршрут:/);
assert.doesNotMatch(minimalText, /Дополнительно:/);
assert.match(minimalText, /Заявка сохранена в amoCRM\./);
assert.match(minimalText, /Источник: сайт «Катер без капитана»/);
assertNoEmptyLabeledLines(minimalText);

const fullText = buildLeadTelegramText(boatFull);
assert.match(fullText, /Катер: Total Black/);
assert.match(fullText, /Дата: 2026-08-01/);
assert.match(fullText, /Время: 18:00/);
assert.match(fullText, /Количество человек: 4/);
assert.match(fullText, /Формат: Прогулка/);
assert.match(fullText, /Маршрут: Нева/);
assert.match(fullText, /Дополнительно: Нужен инструктаж/);
assertNoEmptyLabeledLines(fullText);

const certText = buildLeadTelegramText(cert);
assert.match(certText, /Тип заявки: Подарочный сертификат/);
assert.match(certText, /Продолжительность: 60 минут/);
assert.match(certText, /Telegram: @maria/);
assert.doesNotMatch(certText, /Дополнительно:/);
assertNoEmptyLabeledLines(certText);

assert.equal(sanitizeTelegramPlainText("  ok\u0000\u0007  "), "ok");

console.log("test:telegram ok");
