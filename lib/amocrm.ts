/**
 * Minimal amoCRM server integration (long-lived access token).
 * Never log the token or full PII payloads.
 */

const REQUEST_TIMEOUT_MS = 15_000;

/** Public site URL shown in deal notes (not a secret). */
export const AMOCRM_SITE_URL =
  process.env.SITE_PUBLIC_URL?.replace(/\/$/, "") ||
  "https://vilisbut504-cmyk-spb-boat-rental-landing-fbb1.twc1.net";

/** User-facing success copy after a real CRM lead is created. */
export const AMOCRM_SUCCESS_MESSAGE =
  "Заявка отправлена. Менеджер свяжется с вами в ближайшее время.";

export const AMOCRM_NOT_CONFIGURED_MESSAGE =
  "Приём заявок через сайт пока настраивается. Пожалуйста, свяжитесь с нами напрямую по телефону, в Telegram или WhatsApp.";

export const AMOCRM_MISCONFIGURED_MESSAGE =
  "Приём заявок через сайт временно недоступен. Пожалуйста, свяжитесь с нами напрямую по телефону, в Telegram или WhatsApp.";

export type AmoCrmConfig = {
  baseUrl: string;
  accessToken: string;
  pipelineId: number;
  statusId: number;
};

export type AmoCrmLeadKind = "boat_rental" | "gift_certificate";

export type BoatRentalLeadInput = {
  kind: "boat_rental";
  name: string;
  phone: string;
  boatName?: string;
  routeName?: string;
  date?: string;
  time?: string;
  guests?: string;
  format?: string;
  comment?: string;
  receivedAt: string;
};

export type GiftCertificateLeadInput = {
  kind: "gift_certificate";
  name: string;
  phone: string;
  certificateDisplayLabel: string;
  certificateDayLabel: string;
  certificateDurationLabel: string;
  /** Server-resolved price label, e.g. "4 990 ₽" */
  certificatePriceLabel: string;
  preferredContactLabel: string;
  telegramUsername?: string;
  comment?: string;
  receivedAt: string;
};

export type AmoCrmLeadInput = BoatRentalLeadInput | GiftCertificateLeadInput;

export type AmoCrmResult =
  | { ok: true; leadId: number }
  | {
      ok: false;
      code:
        | "NOT_CONFIGURED"
        | "UNAUTHORIZED"
        | "FORBIDDEN"
        | "RATE_LIMITED"
        | "BAD_REQUEST"
        | "UPSTREAM_ERROR"
        | "NETWORK_ERROR"
        | "INVALID_RESPONSE";
      /** Safe message for API clients — never amoCRM internals */
      message: string;
    };

export function getAmoCrmConfig(): AmoCrmConfig | null {
  const baseUrl = (process.env.AMOCRM_BASE_URL ?? "").trim().replace(/\/$/, "");
  const accessToken = (process.env.AMOCRM_ACCESS_TOKEN ?? "").trim();
  const pipelineRaw = (process.env.AMOCRM_PIPELINE_ID ?? "").trim();
  const statusRaw = (process.env.AMOCRM_STATUS_ID ?? "").trim();

  if (!baseUrl || !accessToken || !pipelineRaw || !statusRaw) {
    return null;
  }

  // Accept amoCRM and Kommo hosts; ignore path leftovers after trim.
  let host = "";
  try {
    host = new URL(baseUrl).host.toLowerCase();
  } catch {
    console.error("[amocrm] AMOCRM_BASE_URL is not a valid URL");
    return null;
  }
  const hostOk =
    host.endsWith(".amocrm.ru") ||
    host === "amocrm.ru" ||
    host.endsWith(".kommo.com") ||
    host === "kommo.com";
  if (!baseUrl.startsWith("https://") || !hostOk) {
    console.error("[amocrm] AMOCRM_BASE_URL host is not an amoCRM/Kommo https host");
    return null;
  }

  const pipelineId = Number(pipelineRaw);
  const statusId = Number(statusRaw);
  if (!Number.isInteger(pipelineId) || pipelineId <= 0) {
    console.error("[amocrm] AMOCRM_PIPELINE_ID is invalid");
    return null;
  }
  if (!Number.isInteger(statusId) || statusId <= 0) {
    console.error("[amocrm] AMOCRM_STATUS_ID is invalid");
    return null;
  }

  return { baseUrl, accessToken, pipelineId, statusId };
}

/** True when at least one AMOCRM_* variable is present (possibly incomplete). */
export function hasAnyAmoCrmEnv(): boolean {
  return Boolean(
    (process.env.AMOCRM_BASE_URL ?? "").trim() ||
      (process.env.AMOCRM_ACCESS_TOKEN ?? "").trim() ||
      (process.env.AMOCRM_PIPELINE_ID ?? "").trim() ||
      (process.env.AMOCRM_STATUS_ID ?? "").trim()
  );
}

export function isAmoCrmConfigured(): boolean {
  return getAmoCrmConfig() !== null;
}

export function buildDealName(input: AmoCrmLeadInput): string {
  if (input.kind === "gift_certificate") {
    return `Заявка с сайта — подарочный сертификат — ${input.name}`;
  }
  const boat = input.boatName?.trim();
  if (boat) {
    return `Заявка с сайта — ${boat} — ${input.name}`;
  }
  return `Заявка с сайта — аренда — ${input.name}`;
}

export function buildNoteText(input: AmoCrmLeadInput): string {
  const lines: string[] = [];

  if (input.kind === "boat_rental") {
    lines.push("Тип заявки: Аренда катера");
    lines.push(`Имя: ${input.name}`);
    lines.push(`Телефон: ${input.phone}`);
    lines.push(`Катер: ${input.boatName?.trim() || "не выбран"}`);
    lines.push(`Маршрут: ${input.routeName?.trim() || "не выбран"}`);
    lines.push(`Дата: ${input.date?.trim() || "не указана"}`);
    lines.push(`Время: ${input.time?.trim() || "не указано"}`);
    lines.push(`Количество человек: ${input.guests?.trim() || "не указано"}`);
    lines.push(`Формат прогулки: ${input.format?.trim() || "не указан"}`);
    lines.push(`Комментарий: ${input.comment?.trim() || "—"}`);
  } else {
    lines.push("Тип заявки: Подарочный сертификат");
    lines.push(`Имя: ${input.name}`);
    lines.push(`Телефон: ${input.phone}`);
    lines.push(`Тариф: ${input.certificateDisplayLabel}`);
    lines.push(`Дни тарифа: ${input.certificateDayLabel}`);
    lines.push(`Продолжительность: ${input.certificateDurationLabel}`);
    lines.push(`Цена (сервер): ${input.certificatePriceLabel}`);
    lines.push(`Предпочтительный способ связи: ${input.preferredContactLabel}`);
    if (input.telegramUsername?.trim()) {
      lines.push(`Telegram: ${input.telegramUsername.trim()}`);
    }
    lines.push(`Комментарий: ${input.comment?.trim() || "—"}`);
  }

  lines.push('Источник: сайт «Катер без капитана»');
  lines.push(`Адрес сайта: ${AMOCRM_SITE_URL}`);
  lines.push(`Дата и время создания заявки: ${input.receivedAt}`);

  return lines.join("\n");
}

function dealTags(kind: AmoCrmLeadKind): { name: string }[] {
  return [
    { name: "сайт" },
    { name: kind === "gift_certificate" ? "подарочный сертификат" : "аренда" },
  ];
}

function safeUpstreamMessage(
  code: Exclude<Extract<AmoCrmResult, { ok: false }>["code"], "NOT_CONFIGURED">
): string {
  switch (code) {
    case "UNAUTHORIZED":
    case "FORBIDDEN":
      return "Не удалось отправить заявку. Пожалуйста, свяжитесь с нами напрямую по телефону, в Telegram или WhatsApp.";
    case "RATE_LIMITED":
      return "Сейчас слишком много обращений. Пожалуйста, подождите минуту или свяжитесь с нами напрямую.";
    case "BAD_REQUEST":
    case "UPSTREAM_ERROR":
    case "NETWORK_ERROR":
    case "INVALID_RESPONSE":
    default:
      return "Не удалось отправить заявку. Пожалуйста, свяжитесь с нами напрямую по телефону, в Telegram или WhatsApp.";
  }
}

function mapHttpStatus(status: number): Extract<AmoCrmResult, { ok: false }> {
  if (status === 401) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      message: safeUpstreamMessage("UNAUTHORIZED"),
    };
  }
  if (status === 403) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: safeUpstreamMessage("FORBIDDEN"),
    };
  }
  if (status === 429) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      message: safeUpstreamMessage("RATE_LIMITED"),
    };
  }
  if (status >= 400 && status < 500) {
    return {
      ok: false,
      code: "BAD_REQUEST",
      message: safeUpstreamMessage("BAD_REQUEST"),
    };
  }
  return {
    ok: false,
    code: "UPSTREAM_ERROR",
    message: safeUpstreamMessage("UPSTREAM_ERROR"),
  };
}

async function amoFetch(
  config: AmoCrmConfig,
  path: string,
  init: RequestInit,
  fetchImpl: typeof fetch = fetch
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetchImpl(`${config.baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function parseComplexLeadId(body: unknown): number | null {
  if (!Array.isArray(body) || body.length === 0) return null;
  const first = body[0] as { id?: unknown };
  const id = Number(first?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Exported for unit tests — builds the complex-leads body without calling the API. */
export function buildComplexLeadPayload(
  config: AmoCrmConfig,
  input: AmoCrmLeadInput
) {
  return [
    {
      name: buildDealName(input),
      pipeline_id: config.pipelineId,
      status_id: config.statusId,
      _embedded: {
        tags: dealTags(input.kind),
        contacts: [
          {
            name: input.name,
            custom_fields_values: [
              {
                field_code: "PHONE",
                values: [{ value: input.phone, enum_code: "WORK" }],
              },
            ],
          },
        ],
      },
    },
  ];
}

export async function createLeadInAmoCrm(
  input: AmoCrmLeadInput,
  fetchImpl: typeof fetch = fetch
): Promise<AmoCrmResult> {
  try {
    const config = getAmoCrmConfig();
    if (!config) {
      return {
        ok: false,
        code: "NOT_CONFIGURED",
        message: AMOCRM_NOT_CONFIGURED_MESSAGE,
      };
    }

    const complexBody = buildComplexLeadPayload(config, input);

    let complexRes: Response;
    try {
      complexRes = await amoFetch(
        config,
        "/api/v4/leads/complex",
        {
          method: "POST",
          body: JSON.stringify(complexBody),
        },
        fetchImpl
      );
    } catch (err) {
      console.error(
        "[amocrm] complex request failed",
        err instanceof Error ? err.name : "error"
      );
      return {
        ok: false,
        code: "NETWORK_ERROR",
        message: safeUpstreamMessage("NETWORK_ERROR"),
      };
    }

    if (!complexRes.ok) {
      console.error("[amocrm] complex status", complexRes.status);
      return mapHttpStatus(complexRes.status);
    }

    let complexJson: unknown;
    try {
      complexJson = await complexRes.json();
    } catch {
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message: safeUpstreamMessage("INVALID_RESPONSE"),
      };
    }

    const leadId = parseComplexLeadId(complexJson);
    if (!leadId) {
      console.error("[amocrm] complex response missing lead id");
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message: safeUpstreamMessage("INVALID_RESPONSE"),
      };
    }

    const noteBody = [
      {
        note_type: "common",
        params: { text: buildNoteText(input) },
      },
    ];

    try {
      const noteRes = await amoFetch(
        config,
        `/api/v4/leads/${leadId}/notes`,
        {
          method: "POST",
          body: JSON.stringify(noteBody),
        },
        fetchImpl
      );
      if (!noteRes.ok) {
        console.error("[amocrm] note status", noteRes.status);
      }
    } catch (err) {
      console.error(
        "[amocrm] note request failed",
        err instanceof Error ? err.name : "error"
      );
    }

    return { ok: true, leadId };
  } catch (err) {
    console.error(
      "[amocrm] unexpected",
      err instanceof Error ? err.name : "error"
    );
    return {
      ok: false,
      code: "UPSTREAM_ERROR",
      message: safeUpstreamMessage("UPSTREAM_ERROR"),
    };
  }
}
