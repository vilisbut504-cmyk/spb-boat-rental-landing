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
  | { ok: true; leadId: number; noteCreated: boolean }
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

function toSafePositiveInt(raw: string, label: string): number | null {
  const n = Number(raw.trim());
  if (!Number.isSafeInteger(n) || n <= 0) {
    console.error(`[amocrm] ${label} is invalid`);
    return null;
  }
  return n;
}

export function getAmoCrmConfig(): AmoCrmConfig | null {
  const baseUrl = (process.env.AMOCRM_BASE_URL ?? "").trim().replace(/\/$/, "");
  const accessToken = (process.env.AMOCRM_ACCESS_TOKEN ?? "").trim();
  const pipelineRaw = (process.env.AMOCRM_PIPELINE_ID ?? "").trim();
  const statusRaw = (process.env.AMOCRM_STATUS_ID ?? "").trim();

  if (!baseUrl || !accessToken || !pipelineRaw || !statusRaw) {
    return null;
  }

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
    console.error(
      "[amocrm] AMOCRM_BASE_URL host is not an amoCRM/Kommo https host"
    );
    return null;
  }

  const pipelineId = toSafePositiveInt(pipelineRaw, "AMOCRM_PIPELINE_ID");
  const statusId = toSafePositiveInt(statusRaw, "AMOCRM_STATUS_ID");
  if (pipelineId == null || statusId == null) return null;

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

/** Extract lead id from top-level complex response array: response[0].id */
export function parseComplexLeadId(body: unknown): number | null {
  if (!Array.isArray(body) || body.length === 0) return null;
  const first = body[0] as { id?: unknown };
  const id = Number(first?.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return id;
}

type SafeValidationError = {
  request_id?: string;
  field?: string;
  code?: string;
  path?: string;
  index?: number | string;
};

/** Sanitize amoCRM problem+json / validation body for logs — no PII. */
export function extractSafeAmoError(body: unknown): {
  title?: string;
  detail?: string;
  type?: string;
  validationErrors: SafeValidationError[];
} {
  if (!body || typeof body !== "object") {
    return { validationErrors: [] };
  }
  const obj = body as Record<string, unknown>;
  const title = typeof obj.title === "string" ? obj.title : undefined;
  const detail = typeof obj.detail === "string" ? obj.detail : undefined;
  const type = typeof obj.type === "string" ? obj.type : undefined;

  const validationErrors: SafeValidationError[] = [];
  const rawList = obj["validation-errors"] ?? obj.validation_errors;

  if (Array.isArray(rawList)) {
    for (const entry of rawList) {
      if (!entry || typeof entry !== "object") continue;
      const item = entry as Record<string, unknown>;
      const requestId =
        typeof item.request_id === "string" ? item.request_id : undefined;
      const errors = Array.isArray(item.errors) ? item.errors : [item];

      for (const err of errors) {
        if (!err || typeof err !== "object") continue;
        const e = err as Record<string, unknown>;
        const safe: SafeValidationError = {};
        if (requestId) safe.request_id = requestId;
        if (typeof e.request_id === "string") safe.request_id = e.request_id;
        if (typeof e.field === "string") safe.field = e.field;
        if (typeof e.code === "string") safe.code = e.code;
        if (typeof e.path === "string") safe.path = e.path;
        if (typeof e.index === "number" || typeof e.index === "string") {
          safe.index = e.index;
        }
        // Some amo responses put path as array like ["0", "status_id"]
        if (Array.isArray(e.path)) {
          safe.path = e.path.map(String).join(".");
        }
        if (Object.keys(safe).length > 0) validationErrors.push(safe);
      }
    }
  }

  return { title, detail, type, validationErrors };
}

async function logFailedAmoResponse(
  label: string,
  res: Response
): Promise<void> {
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const isJson =
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json");

  if (!isJson) {
    console.error(`[amocrm] ${label} failed`, { status: res.status });
    return;
  }

  try {
    const body = await res.json();
    const safe = extractSafeAmoError(body);
    console.error(`[amocrm] ${label} failed`, {
      status: res.status,
      title: safe.title,
      detail: safe.detail,
      type: safe.type,
      validationErrors: safe.validationErrors,
    });
  } catch {
    console.error(`[amocrm] ${label} failed`, { status: res.status });
  }
}

/**
 * Official leads/complex payload shape.
 * - tags via tags_to_add (not _embedded.tags)
 * - contact via first_name + PHONE field_code
 * - no metadata (keep deal on the chosen status, not unsorted)
 */
export function buildComplexLeadPayload(
  config: AmoCrmConfig,
  input: AmoCrmLeadInput
) {
  const pipelineId = Number(config.pipelineId);
  const statusId = Number(config.statusId);
  if (!Number.isSafeInteger(pipelineId) || pipelineId <= 0) {
    throw new Error("invalid_pipeline_id");
  }
  if (!Number.isSafeInteger(statusId) || statusId <= 0) {
    throw new Error("invalid_status_id");
  }

  const firstName = input.name.trim();
  const phone = input.phone.trim();
  if (!/^\+7\d{10}$/.test(phone)) {
    throw new Error("invalid_phone");
  }

  return [
    {
      name: buildDealName(input),
      pipeline_id: pipelineId,
      status_id: statusId,
      tags_to_add: dealTags(input.kind),
      _embedded: {
        contacts: [
          {
            first_name: firstName,
            custom_fields_values: [
              {
                field_code: "PHONE",
                values: [
                  {
                    enum_code: "WORK",
                    value: phone,
                  },
                ],
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

    let complexBody: ReturnType<typeof buildComplexLeadPayload>;
    try {
      complexBody = buildComplexLeadPayload(config, input);
    } catch {
      return {
        ok: false,
        code: "BAD_REQUEST",
        message: safeUpstreamMessage("BAD_REQUEST"),
      };
    }

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
      await logFailedAmoResponse("complex", complexRes);
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
    if (leadId == null) {
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

    let noteCreated = false;
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
      if (noteRes.ok) {
        noteCreated = true;
      } else {
        console.error("[amocrm] note partial failure", {
          leadId,
          status: noteRes.status,
        });
      }
    } catch (err) {
      console.error("[amocrm] note partial failure", {
        leadId,
        error: err instanceof Error ? err.name : "error",
      });
    }

    return { ok: true, leadId, noteCreated };
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
