/**
 * Telegram lead notification checks (no real network, no secrets).
 * Run: npm run test:telegram
 */

import assert from "node:assert/strict";
import {
  buildLeadTelegramText,
  isRetryableTelegramHttpStatus,
  isTelegramConfigured,
  notifyLeadTelegram,
  REQUEST_TIMEOUT_MS,
  sanitizeTelegramPlainText,
} from "../lib/telegram.ts";
import type { AmoCrmLeadInput } from "../lib/amocrm.ts";

function assertNoEmptyLabeledLines(text: string) {
  for (const line of text.split("\n")) {
    assert.doesNotMatch(
      line,
      /:\s*$/,
      `empty labeled line: ${JSON.stringify(line)}`
    );
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

assert.equal(REQUEST_TIMEOUT_MS, 10_000);
assert.equal(isRetryableTelegramHttpStatus(429), true);
assert.equal(isRetryableTelegramHttpStatus(502), true);
assert.equal(isRetryableTelegramHttpStatus(503), true);
assert.equal(isRetryableTelegramHttpStatus(504), true);
assert.equal(isRetryableTelegramHttpStatus(400), false);
assert.equal(isRetryableTelegramHttpStatus(401), false);
assert.equal(isRetryableTelegramHttpStatus(403), false);
assert.equal(isRetryableTelegramHttpStatus(404), false);

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

const prevToken = process.env.TELEGRAM_BOT_TOKEN;
const prevChat = process.env.TELEGRAM_CHAT_ID;

function restoreEnv() {
  if (prevToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
  else process.env.TELEGRAM_BOT_TOKEN = prevToken;
  if (prevChat === undefined) delete process.env.TELEGRAM_CHAT_ID;
  else process.env.TELEGRAM_CHAT_ID = prevChat;
}

// Missing env → skip, no fetch
delete process.env.TELEGRAM_BOT_TOKEN;
delete process.env.TELEGRAM_CHAT_ID;
assert.equal(isTelegramConfigured(), false);
let missingFetchCalls = 0;
const missing = await notifyLeadTelegram(boatMinimal, async () => {
  missingFetchCalls += 1;
  return new Response("{}");
});
assert.equal(missing.ok, true);
assert.equal(missing.skipped, true);
assert.equal(missing.reason, "configuration_missing");
assert.equal(missingFetchCalls, 0);

process.env.TELEGRAM_BOT_TOKEN = "TEST_TOKEN_NOT_REAL";
process.env.TELEGRAM_CHAT_ID = "-100123";
assert.equal(isTelegramConfigured(), true);

// Success on first attempt
let successCalls = 0;
const ok = await notifyLeadTelegram(boatMinimal, async () => {
  successCalls += 1;
  return new Response(JSON.stringify({ ok: true, result: {} }), {
    status: 200,
  });
});
assert.equal(ok.ok, true);
assert.equal(ok.skipped, false);
if (!ok.ok || ok.skipped) throw new Error("expected telegram success");
assert.equal(ok.attempts, 1);
assert.equal(successCalls, 1);

// Timeout then success on retry
let timeoutCalls = 0;
const timeoutThenOk = await notifyLeadTelegram(boatMinimal, async () => {
  timeoutCalls += 1;
  if (timeoutCalls === 1) {
    const err = new Error("aborted");
    err.name = "AbortError";
    throw err;
  }
  return new Response(JSON.stringify({ ok: true, result: {} }), {
    status: 200,
  });
});
assert.equal(timeoutThenOk.ok, true);
assert.equal(timeoutThenOk.skipped, false);
if (!timeoutThenOk.ok || timeoutThenOk.skipped) {
  throw new Error("expected telegram success after timeout retry");
}
assert.equal(timeoutThenOk.attempts, 2);
assert.equal(timeoutCalls, 2);

// Network error twice → soft fail after retry
let networkCalls = 0;
const networkFail = await notifyLeadTelegram(boatMinimal, async () => {
  networkCalls += 1;
  throw new TypeError("fetch failed");
});
assert.equal(networkFail.ok, false);
if (networkFail.ok) throw new Error("expected network failure");
assert.equal(networkFail.reason, "network_error");
assert.equal(networkFail.attempts, 2);
assert.equal(networkCalls, 2);

// HTTP 429 then success
let rateCalls = 0;
const rateThenOk = await notifyLeadTelegram(boatMinimal, async () => {
  rateCalls += 1;
  if (rateCalls === 1) {
    return new Response("rate", { status: 429 });
  }
  return new Response(JSON.stringify({ ok: true, result: {} }), {
    status: 200,
  });
});
assert.equal(rateThenOk.ok, true);
assert.equal(rateThenOk.skipped, false);
if (!rateThenOk.ok || rateThenOk.skipped) {
  throw new Error("expected telegram success after 429 retry");
}
assert.equal(rateThenOk.attempts, 2);
assert.equal(rateCalls, 2);

// HTTP 503 twice → soft fail
let unavailableCalls = 0;
const unavailable = await notifyLeadTelegram(boatMinimal, async () => {
  unavailableCalls += 1;
  return new Response("down", { status: 503 });
});
assert.equal(unavailable.ok, false);
if (unavailable.ok) throw new Error("expected 503 failure");
assert.equal(unavailable.reason, "http_error");
assert.equal(unavailable.status, 503);
assert.equal(unavailable.attempts, 2);
assert.equal(unavailableCalls, 2);

// HTTP 400 — no retry
let badCalls = 0;
const badRequest = await notifyLeadTelegram(boatMinimal, async () => {
  badCalls += 1;
  return new Response("bad", { status: 400 });
});
assert.equal(badRequest.ok, false);
if (badRequest.ok) throw new Error("expected 400 failure");
assert.equal(badRequest.reason, "http_error");
assert.equal(badRequest.status, 400);
assert.equal(badRequest.attempts, 1);
assert.equal(badCalls, 1);

// telegram_api_error (HTTP 200, ok:false) — no retry
let apiCalls = 0;
const apiError = await notifyLeadTelegram(boatMinimal, async () => {
  apiCalls += 1;
  return new Response(JSON.stringify({ ok: false, error_code: 400 }), {
    status: 200,
  });
});
assert.equal(apiError.ok, false);
if (apiError.ok) throw new Error("expected telegram_api_error");
assert.equal(apiError.reason, "telegram_api_error");
assert.equal(apiError.errorCode, 400);
assert.equal(apiError.attempts, 1);
assert.equal(apiCalls, 1);

restoreEnv();

console.log("test:telegram ok");
