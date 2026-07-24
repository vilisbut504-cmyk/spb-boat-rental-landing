/**
 * Telegram lead notification checks (no real Telegram network, no secrets).
 * Run: npm run test:telegram
 */

import assert from "node:assert/strict";
import {
  buildLeadTelegramText,
  defaultTelegramIpv4Transport,
  isTelegramConfigured,
  notifyLeadTelegram,
  REQUEST_TIMEOUT_MS,
  sanitizeTelegramPlainText,
  TELEGRAM_DNS_FAMILY,
  telegramIpv4Lookup,
  withTelegramIpv4LookupOptions,
  type TelegramTransport,
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

assert.equal(REQUEST_TIMEOUT_MS, 3_000);
assert.equal(TELEGRAM_DNS_FAMILY, 4);
assert.equal(typeof telegramIpv4Lookup, "function");
assert.equal(typeof defaultTelegramIpv4Transport, "function");

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

// Missing env → skip, transport never called (amoCRM path stays healthy)
delete process.env.TELEGRAM_BOT_TOKEN;
delete process.env.TELEGRAM_CHAT_ID;
assert.equal(isTelegramConfigured(), false);
let missingCalls = 0;
const missing = await notifyLeadTelegram(boatMinimal, async () => {
  missingCalls += 1;
  return { status: 200, body: { ok: true } };
});
assert.equal(missing.ok, true);
assert.equal(missing.skipped, true);
assert.equal(missing.reason, "configuration_missing");
assert.equal(missingCalls, 0);

process.env.TELEGRAM_BOT_TOKEN = "TEST_TOKEN_NOT_REAL";
process.env.TELEGRAM_CHAT_ID = "-100123";
assert.equal(isTelegramConfigured(), true);

// Success — single attempt
let successCalls = 0;
const ok = await notifyLeadTelegram(boatMinimal, async () => {
  successCalls += 1;
  return { status: 200, body: { ok: true, result: {} } };
});
assert.equal(ok.ok, true);
assert.equal(ok.skipped, false);
assert.equal(successCalls, 1);

// IPv4 is forced for Telegram DNS (pure options + default transport wiring)
{
  const forced = withTelegramIpv4LookupOptions({ family: 6, hints: 0 });
  assert.equal(forced.family, 4);
  assert.equal(forced.all, false);
  assert.equal(withTelegramIpv4LookupOptions(6).family, 4);
  assert.equal(withTelegramIpv4LookupOptions().family, 4);
  assert.equal(typeof telegramIpv4Lookup, "function");
  assert.equal(defaultTelegramIpv4Transport.name, "defaultTelegramIpv4Transport");
}

// Timeout after ~3s, no second attempt
let timeoutCalls = 0;
const hangTransport: TelegramTransport = async ({ signal }) => {
  timeoutCalls += 1;
  await new Promise<never>((_, reject) => {
    const onAbort = () => {
      const err = new Error("aborted");
      err.name = "AbortError";
      reject(err);
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
  return { status: 200, body: { ok: true } };
};
const started = Date.now();
const timedOut = await notifyLeadTelegram(boatMinimal, hangTransport);
const elapsed = Date.now() - started;
assert.equal(timedOut.ok, false);
if (timedOut.ok) throw new Error("expected timeout");
assert.equal(timedOut.reason, "timeout");
assert.equal(timeoutCalls, 1);
assert.ok(elapsed >= 2500, `timeout too fast: ${elapsed}ms`);
assert.ok(elapsed < 4500, `timeout too slow: ${elapsed}ms`);

// Network failure — soft fail, no retry, does not throw
let networkCalls = 0;
const networkFail = await notifyLeadTelegram(boatMinimal, async () => {
  networkCalls += 1;
  throw new TypeError("fetch failed");
});
assert.equal(networkFail.ok, false);
if (networkFail.ok) throw new Error("expected network_error");
assert.equal(networkFail.reason, "network_error");
assert.equal(networkCalls, 1);

// HTTP error — soft fail, no retry
let httpCalls = 0;
const httpFail = await notifyLeadTelegram(boatMinimal, async () => {
  httpCalls += 1;
  return { status: 503, body: null };
});
assert.equal(httpFail.ok, false);
if (httpFail.ok) throw new Error("expected http_error");
assert.equal(httpFail.reason, "http_error");
assert.equal(httpFail.status, 503);
assert.equal(httpCalls, 1);

// API error (HTTP 200, ok:false) — soft fail, no retry
let apiCalls = 0;
const apiFail = await notifyLeadTelegram(boatMinimal, async () => {
  apiCalls += 1;
  return { status: 200, body: { ok: false, error_code: 400 } };
});
assert.equal(apiFail.ok, false);
if (apiFail.ok) throw new Error("expected telegram_api_error");
assert.equal(apiFail.reason, "telegram_api_error");
assert.equal(apiFail.errorCode, 400);
assert.equal(apiCalls, 1);

// Explicit: timeout also does not retry
assert.equal(timeoutCalls, 1);

restoreEnv();

console.log("test:telegram ok");
