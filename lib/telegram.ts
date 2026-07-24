/**
 * Server-only Telegram Bot API helper for lead notifications.
 * Never log the bot token, chat id, API URL, or PII from the message body.
 */

import type { AmoCrmLeadInput } from "./amocrm";

const REQUEST_TIMEOUT_MS = 8_000;
/** Telegram Bot API hard limit is 4096; keep headroom for safety. */
const MAX_MESSAGE_LENGTH = 3900;

export type TelegramNotifyResult =
  | { ok: true; skipped: true; reason: "not_configured" }
  | { ok: true; skipped: false }
  | {
      ok: false;
      reason: "http_error" | "api_error" | "timeout" | "network" | "invalid_response";
      status?: number;
      errorCode?: number;
    };

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
 * Notify the configured Telegram chat after a successful amoCRM lead create.
 * Never throws — failures are logged without secrets or PII.
 */
export async function notifyLeadTelegram(
  input: AmoCrmLeadInput,
  fetchImpl: typeof fetch = fetch
): Promise<TelegramNotifyResult> {
  const config = getTelegramConfig();
  if (!config) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing — notification skipped"
    );
    return { ok: true, skipped: true, reason: "not_configured" };
  }

  const text = buildLeadTelegramText(input);
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
      console.warn("[telegram] sendMessage HTTP error", { status: res.status });
      return { ok: false, reason: "http_error", status: res.status };
    }

    let body: unknown;
    try {
      body = await res.json();
    } catch {
      console.warn("[telegram] sendMessage invalid JSON response");
      return { ok: false, reason: "invalid_response" };
    }

    if (
      !body ||
      typeof body !== "object" ||
      (body as { ok?: unknown }).ok !== true
    ) {
      const errorCode = (body as { error_code?: unknown } | null)?.error_code;
      console.warn("[telegram] sendMessage API not ok", {
        errorCode: typeof errorCode === "number" ? errorCode : undefined,
      });
      return {
        ok: false,
        reason: "api_error",
        errorCode: typeof errorCode === "number" ? errorCode : undefined,
      };
    }

    return { ok: true, skipped: false };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("[telegram] sendMessage timeout");
      return { ok: false, reason: "timeout" };
    }
    console.warn(
      "[telegram] sendMessage failed",
      err instanceof Error ? err.name : "error"
    );
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}
