/**
 * Server-only Telegram Bot API helper for lead notifications.
 * Never log the bot token, chat id, API URL, or PII from the message body.
 *
 * Production note (Timeweb): connections to api.telegram.org use IPv4-only DNS
 * lookup inside this module to avoid hanging dual-stack / IPv6 paths.
 */

import dns from "node:dns";
import https from "node:https";
import type { LookupFunction } from "node:net";
import type { AmoCrmLeadInput } from "./amocrm";

/** Hard cap for the single Telegram attempt on the /api/lead critical path. */
export const REQUEST_TIMEOUT_MS = 3_000;

/** Confirms Telegram DNS is forced to IPv4 (no global Node DNS change). */
export const TELEGRAM_DNS_FAMILY = 4 as const;

/** Telegram Bot API hard limit is 4096; keep headroom for safety. */
const MAX_MESSAGE_LENGTH = 3900;
const TELEGRAM_HOST = "api.telegram.org";

export type TelegramNotifyResult =
  | { ok: true; skipped: true; reason: "configuration_missing" }
  | { ok: true; skipped: false }
  | {
      ok: false;
      reason:
        | "timeout"
        | "network_error"
        | "http_error"
        | "telegram_api_error"
        | "invalid_response";
      status?: number;
      errorCode?: number;
    };

export type TelegramTransportResult = {
  status: number;
  body: unknown;
};

/**
 * Injectable transport for tests. Production uses IPv4 HTTPS to api.telegram.org.
 */
export type TelegramTransport = (args: {
  token: string;
  chatId: string;
  text: string;
  signal: AbortSignal;
}) => Promise<TelegramTransportResult>;

function getTelegramConfig(): { token: string; chatId: string } | null {
  const token = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? "").trim();
  if (!token || !chatId) return null;
  return { token, chatId };
}

export function isTelegramConfigured(): boolean {
  return getTelegramConfig() !== null;
}

/** Strip control chars that can break plain-text Telegram messages. */
export function sanitizeTelegramPlainText(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function pushIfPresent(lines: string[], label: string, value: string | undefined) {
  const cleaned = sanitizeTelegramPlainText(value ?? "");
  if (!cleaned) return;
  lines.push(`${label}: ${cleaned}`);
}

/**
 * Build a plain-text lead notification from the same fields amoCRM already receives.
 * Optional rows are omitted when empty — no blank "Катер:" lines.
 */
export function buildLeadTelegramText(input: AmoCrmLeadInput): string {
  const lines: string[] = ["🚤 Новая заявка с сайта", ""];

  if (input.kind === "boat_rental") {
    lines.push("Тип заявки: Аренда катера");
    pushIfPresent(lines, "Клиент", input.name);
    pushIfPresent(lines, "Телефон", input.phone);
    pushIfPresent(lines, "Катер", input.boatName);
    pushIfPresent(lines, "Дата", input.date);
    pushIfPresent(lines, "Время", input.time);
    pushIfPresent(lines, "Количество человек", input.guests);
    pushIfPresent(lines, "Формат", input.format);
    pushIfPresent(lines, "Маршрут", input.routeName);
    pushIfPresent(lines, "Дополнительно", input.comment);
  } else {
    lines.push("Тип заявки: Подарочный сертификат");
    pushIfPresent(lines, "Клиент", input.name);
    pushIfPresent(lines, "Телефон", input.phone);
    pushIfPresent(lines, "Тариф", input.certificateDisplayLabel);
    pushIfPresent(lines, "Дни тарифа", input.certificateDayLabel);
    pushIfPresent(lines, "Продолжительность", input.certificateDurationLabel);
    pushIfPresent(lines, "Цена", input.certificatePriceLabel);
    pushIfPresent(lines, "Способ связи", input.preferredContactLabel);
    pushIfPresent(lines, "Telegram", input.telegramUsername);
    pushIfPresent(lines, "Дополнительно", input.comment);
  }

  lines.push("");
  lines.push("Заявка сохранена в amoCRM.");
  lines.push("");
  lines.push("Источник: сайт «Катер без капитана»");

  const text = lines.join("\n");
  if (text.length <= MAX_MESSAGE_LENGTH) return text;
  return `${text.slice(0, MAX_MESSAGE_LENGTH - 1)}…`;
}

/**
 * Merge caller lookup options with a hard IPv4 family for Telegram only.
 * Exported for unit tests — does not touch process-wide DNS.
 */
export function withTelegramIpv4LookupOptions(
  options?: dns.LookupOptions | number
): dns.LookupOneOptions {
  if (typeof options === "number") {
    return { family: TELEGRAM_DNS_FAMILY };
  }
  return {
    ...(options ?? {}),
    family: TELEGRAM_DNS_FAMILY,
    all: false,
  };
}

/**
 * DNS lookup forced to IPv4 for Telegram only.
 * Does not change process-wide DNS defaults.
 */
export function telegramIpv4Lookup(
  hostname: string,
  options: dns.LookupOneOptions,
  callback: (
    err: NodeJS.ErrnoException | null,
    address: string,
    family: number
  ) => void
): void {
  dns.lookup(
    hostname,
    withTelegramIpv4LookupOptions(options),
    (err, address, family) => {
      if (err) {
        callback(err, "", 0);
        return;
      }
      callback(null, String(address), Number(family) || TELEGRAM_DNS_FAMILY);
    }
  );
}

function abortError(): Error {
  const err = new Error("The operation was aborted");
  err.name = "AbortError";
  return err;
}

/**
 * POST JSON to Telegram Bot API over HTTPS with IPv4-only DNS and TLS verified.
 * Path embeds the bot token — never log hostname+path together as a full URL.
 */
export const defaultTelegramIpv4Transport: TelegramTransport = ({
  token,
  chatId,
  text,
  signal,
}) =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }

    const body = JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    });

    const req = https.request(
      {
        hostname: TELEGRAM_HOST,
        method: "POST",
        path: `/bot${token}/sendMessage`,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        lookup: telegramIpv4Lookup as LookupFunction,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let parsed: unknown = null;
          if (raw) {
            try {
              parsed = JSON.parse(raw);
            } catch {
              parsed = null;
            }
          }
          resolve({ status: res.statusCode ?? 0, body: parsed });
        });
      }
    );

    const onAbort = () => {
      req.destroy(abortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });

    req.on("error", (err) => {
      signal.removeEventListener("abort", onAbort);
      if (signal.aborted || (err instanceof Error && err.name === "AbortError")) {
        reject(abortError());
        return;
      }
      reject(err);
    });

    req.on("close", () => {
      signal.removeEventListener("abort", onAbort);
    });

    req.write(body);
    req.end();
  });

function logTelegram(
  event:
    | "success"
    | "configuration_missing"
    | "timeout"
    | "network_error"
    | "http_error"
    | "telegram_api_error"
    | "invalid_response",
  status?: number
): void {
  if (event === "http_error" && status != null) {
    console.warn(`[telegram] http_error status=${status}`);
    return;
  }
  if (event === "success") {
    console.info(`[telegram] ${event}`);
    return;
  }
  console.warn(`[telegram] ${event}`);
}

/**
 * Notify the configured Telegram chat after a successful amoCRM lead create.
 * Single attempt, ~3s max — never throws; never retries on the /api/lead path.
 */
export async function notifyLeadTelegram(
  input: AmoCrmLeadInput,
  transport: TelegramTransport = defaultTelegramIpv4Transport
): Promise<TelegramNotifyResult> {
  const config = getTelegramConfig();
  if (!config) {
    logTelegram("configuration_missing");
    return { ok: true, skipped: true, reason: "configuration_missing" };
  }

  const text = buildLeadTelegramText(input);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await transport({
      token: config.token,
      chatId: config.chatId,
      text,
      signal: controller.signal,
    });

    if (!res.status || res.status < 200 || res.status >= 300) {
      logTelegram("http_error", res.status || 0);
      return { ok: false, reason: "http_error", status: res.status || 0 };
    }

    const body = res.body;
    if (
      !body ||
      typeof body !== "object" ||
      (body as { ok?: unknown }).ok !== true
    ) {
      logTelegram("telegram_api_error");
      const errorCode = (body as { error_code?: unknown } | null)?.error_code;
      return {
        ok: false,
        reason: "telegram_api_error",
        errorCode: typeof errorCode === "number" ? errorCode : undefined,
      };
    }

    logTelegram("success");
    return { ok: true, skipped: false };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      logTelegram("timeout");
      return { ok: false, reason: "timeout" };
    }
    logTelegram("network_error");
    return { ok: false, reason: "network_error" };
  } finally {
    clearTimeout(timer);
  }
}
