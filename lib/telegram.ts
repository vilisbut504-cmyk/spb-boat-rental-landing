/**
 * Server-only Telegram Bot API helper for lead notifications.
 * Never log the bot token, chat id, API URL, or PII from the message body.
 */

import type { AmoCrmLeadInput } from "./amocrm";

/** Per-attempt AbortController budget (was 8s; raised after Timeweb timeouts). */
export const REQUEST_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 500;
const MAX_ATTEMPTS = 2;
/** Telegram Bot API hard limit is 4096; keep headroom for safety. */
const MAX_MESSAGE_LENGTH = 3900;

export type TelegramNotifyResult =
  | { ok: true; skipped: true; reason: "configuration_missing" }
  | { ok: true; skipped: false; attempts: number }
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
      attempts: number;
    };

type AttemptOutcome =
  | { kind: "success" }
  | { kind: "timeout"; retryable: true }
  | { kind: "network_error"; retryable: true }
  | { kind: "http_error"; status: number; retryable: boolean }
  | { kind: "telegram_api_error"; errorCode?: number; retryable: false }
  | { kind: "invalid_response"; retryable: false };

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

export function isRetryableTelegramHttpStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logDiag(
  event:
    | "configuration_missing"
    | "timeout"
    | "network_error"
    | "http_error"
    | "telegram_api_error"
    | "invalid_response"
    | "success"
    | "retry",
  extra?: { status?: number; errorCode?: number; attempt?: number }
): void {
  const payload: Record<string, number | string> = { event };
  if (extra?.status != null) payload.status = extra.status;
  if (extra?.errorCode != null) payload.errorCode = extra.errorCode;
  if (extra?.attempt != null) payload.attempt = extra.attempt;
  if (event === "success") {
    console.info("[telegram]", payload);
  } else {
    console.warn("[telegram]", payload);
  }
}

async function sendOnce(
  config: { token: string; chatId: string },
  text: string,
  fetchImpl: typeof fetch
): Promise<AttemptOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // URL is intentionally not logged — it embeds the bot token.
    const res = await fetchImpl(
      `https://api.telegram.org/bot${config.token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text,
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      return {
        kind: "http_error",
        status: res.status,
        retryable: isRetryableTelegramHttpStatus(res.status),
      };
    }

    let body: unknown;
    try {
      body = await res.json();
    } catch {
      return { kind: "invalid_response", retryable: false };
    }

    if (
      !body ||
      typeof body !== "object" ||
      (body as { ok?: unknown }).ok !== true
    ) {
      const errorCode = (body as { error_code?: unknown } | null)?.error_code;
      return {
        kind: "telegram_api_error",
        errorCode: typeof errorCode === "number" ? errorCode : undefined,
        retryable: false,
      };
    }

    return { kind: "success" };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { kind: "timeout", retryable: true };
    }
    return { kind: "network_error", retryable: true };
  } finally {
    clearTimeout(timer);
  }
}

function toNotifyResult(
  outcome: AttemptOutcome,
  attempts: number
): TelegramNotifyResult {
  switch (outcome.kind) {
    case "success":
      return { ok: true, skipped: false, attempts };
    case "timeout":
      return { ok: false, reason: "timeout", attempts };
    case "network_error":
      return { ok: false, reason: "network_error", attempts };
    case "http_error":
      return {
        ok: false,
        reason: "http_error",
        status: outcome.status,
        attempts,
      };
    case "telegram_api_error":
      return {
        ok: false,
        reason: "telegram_api_error",
        errorCode: outcome.errorCode,
        attempts,
      };
    case "invalid_response":
      return { ok: false, reason: "invalid_response", attempts };
  }
}

/**
 * Notify the configured Telegram chat after a successful amoCRM lead create.
 * Never throws — failures are logged without secrets or PII.
 * One retry only for timeout / network / HTTP 429|502|503|504.
 */
export async function notifyLeadTelegram(
  input: AmoCrmLeadInput,
  fetchImpl: typeof fetch = fetch
): Promise<TelegramNotifyResult> {
  const config = getTelegramConfig();
  if (!config) {
    logDiag("configuration_missing");
    return { ok: true, skipped: true, reason: "configuration_missing" };
  }

  const text = buildLeadTelegramText(input);
  let last: AttemptOutcome = { kind: "network_error", retryable: true };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    last = await sendOnce(config, text, fetchImpl);

    if (last.kind === "success") {
      logDiag("success", { attempt });
      return { ok: true, skipped: false, attempts: attempt };
    }

    if (last.kind === "timeout") {
      logDiag("timeout", { attempt });
    } else if (last.kind === "network_error") {
      logDiag("network_error", { attempt });
    } else if (last.kind === "http_error") {
      logDiag("http_error", { status: last.status, attempt });
    } else if (last.kind === "telegram_api_error") {
      logDiag("telegram_api_error", {
        errorCode: last.errorCode,
        attempt,
      });
    } else {
      logDiag("invalid_response", { attempt });
    }

    const canRetry = last.retryable && attempt < MAX_ATTEMPTS;
    if (!canRetry) {
      return toNotifyResult(last, attempt);
    }

    logDiag("retry", { attempt });
    await sleep(RETRY_DELAY_MS);
  }

  return toNotifyResult(last, MAX_ATTEMPTS);
}
