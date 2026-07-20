/**
 * amoCRM + lead API tests with mocked fetch (no real CRM calls).
 * Run: node --experimental-strip-types scripts/test-amocrm.ts
 */
import assert from "node:assert/strict";
import { getCertificateTariff } from "../data/certificates.ts";
import { normalizeRuPhone } from "../lib/phone.ts";
import {
  buildComplexLeadPayload,
  buildDealName,
  buildNoteText,
  createLeadInAmoCrm,
  extractSafeAmoError,
  getAmoCrmConfig,
  parseComplexLeadId,
  type AmoCrmConfig,
  type BoatRentalLeadInput,
  type GiftCertificateLeadInput,
} from "../lib/amocrm.ts";

let failed = 0;
const logs: unknown[][] = [];
const originalError = console.error;
console.error = (...args: unknown[]) => {
  logs.push(args);
};

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => console.log(`✓ ${name}`))
    .catch((err) => {
      failed++;
      console.log(`✗ ${name}`);
      originalError(err);
    });
}

const ENV_KEYS = [
  "AMOCRM_BASE_URL",
  "AMOCRM_ACCESS_TOKEN",
  "AMOCRM_PIPELINE_ID",
  "AMOCRM_STATUS_ID",
  "LEADS_WEBHOOK_URL",
] as const;

const savedEnv: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) {
  savedEnv[key] = process.env[key];
}

function setAmoEnv(overrides?: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  process.env.AMOCRM_BASE_URL = "https://example.amocrm.ru";
  process.env.AMOCRM_ACCESS_TOKEN = "test-token-value";
  process.env.AMOCRM_PIPELINE_ID = "11123066";
  process.env.AMOCRM_STATUS_ID = "87329746";
  delete process.env.LEADS_WEBHOOK_URL;
  if (overrides) {
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

function clearAmoEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const v = savedEnv[key];
    if (v === undefined) delete process.env[key];
    else process.env[key] = v;
  }
}

const rentalInput: BoatRentalLeadInput = {
  kind: "boat_rental",
  name: "ТЕСТ САЙТА",
  phone: "+79812526969",
  boatName: "Tiffany",
  routeName: "Финский залив и Лахта",
  date: "2026-07-25",
  time: "18:00",
  guests: "2",
  format: "Прогулка",
  comment: "секретный комментарий клиента",
  receivedAt: "2026-07-20T12:00:00.000Z",
};

const certTariff = getCertificateTariff("weekday-60");
assert.ok(certTariff, "weekday-60 tariff must exist");

const certInput: GiftCertificateLeadInput = {
  kind: "gift_certificate",
  name: "ТЕСТ САЙТА",
  phone: "+79812526969",
  certificateDisplayLabel: certTariff.displayLabel,
  certificateDayLabel: certTariff.dayLabel,
  certificateDurationLabel: certTariff.durationLabel,
  certificatePriceLabel: certTariff.priceLabel,
  preferredContactLabel: "WhatsApp",
  comment: "тест сертификата",
  receivedAt: "2026-07-20T12:00:00.000Z",
};

function mockFetchSequence(
  handlers: Array<(url: string, init?: RequestInit) => Response | Promise<Response>>
) {
  let i = 0;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    const handler = handlers[i++];
    if (!handler) {
      throw new Error(`Unexpected fetch #${i}: ${url}`);
    }
    return handler(url, init);
  };
  return { fetchImpl: fetchImpl as typeof fetch, calls };
}

await test("config reads pipeline/status as safe integers", () => {
  setAmoEnv();
  const cfg = getAmoCrmConfig();
  assert.ok(cfg);
  assert.equal(cfg.pipelineId, 11123066);
  assert.equal(cfg.statusId, 87329746);
  assert.equal(typeof cfg.pipelineId, "number");
  assert.equal(typeof cfg.statusId, "number");
});

await test("deal name for rental with boat", () => {
  assert.equal(
    buildDealName(rentalInput),
    "Заявка с сайта — Tiffany — ТЕСТ САЙТА"
  );
});

await test("deal name for rental without boat", () => {
  assert.equal(
    buildDealName({ ...rentalInput, boatName: "" }),
    "Заявка с сайта — аренда — ТЕСТ САЙТА"
  );
});

await test("deal name for certificate", () => {
  assert.equal(
    buildDealName(certInput),
    "Заявка с сайта — подарочный сертификат — ТЕСТ САЙТА"
  );
});

await test("phone starts with +7", () => {
  const phone = normalizeRuPhone("8 981 252-69-69");
  assert.ok(phone.ok);
  assert.ok(phone.canonical.startsWith("+7"));
  assert.equal(phone.canonical, "+79812526969");
});

await test("complex payload matches official leads/complex shape", () => {
  setAmoEnv();
  const cfg = getAmoCrmConfig() as AmoCrmConfig;
  const body = buildComplexLeadPayload(cfg, rentalInput);
  assert.ok(Array.isArray(body));
  assert.equal(body.length, 1);
  assert.equal(typeof body[0].pipeline_id, "number");
  assert.equal(typeof body[0].status_id, "number");
  assert.equal(body[0].pipeline_id, 11123066);
  assert.equal(body[0].status_id, 87329746);
  assert.ok(Array.isArray(body[0].tags_to_add));
  assert.deepEqual(
    body[0].tags_to_add.map((t) => t.name),
    ["сайт", "аренда"]
  );
  assert.equal(
    (body[0] as { _embedded?: { tags?: unknown } })._embedded?.tags,
    undefined
  );
  assert.equal(
    (body[0] as { metadata?: unknown }).metadata,
    undefined
  );
  const contact = body[0]._embedded.contacts[0];
  assert.equal(contact.first_name, "ТЕСТ САЙТА");
  assert.equal(
    (contact as { name?: string }).name,
    undefined
  );
  const phoneField = contact.custom_fields_values[0];
  assert.equal(phoneField.field_code, "PHONE");
  assert.equal(phoneField.values[0].enum_code, "WORK");
  assert.equal(phoneField.values[0].value, "+79812526969");
});

await test("certificate payload uses certificate tag", () => {
  setAmoEnv();
  const cfg = getAmoCrmConfig() as AmoCrmConfig;
  const body = buildComplexLeadPayload(cfg, certInput);
  assert.equal(body[0].tags_to_add[1].name, "подарочный сертификат");
});

await test("certificate note uses server price label", () => {
  const note = buildNoteText(certInput);
  assert.match(note, /Тип заявки: Подарочный сертификат/);
  assert.match(
    note,
    new RegExp(certTariff.priceLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  );
});

await test("parseComplexLeadId uses response[0].id", () => {
  assert.equal(
    parseComplexLeadId([
      { id: 123, contact_id: 456, merged: false, request_id: ["x"] },
    ]),
    123
  );
  assert.equal(
    parseComplexLeadId({ _embedded: { leads: [{ id: 999 }] } }),
    null
  );
});

await test("rental creates lead then note; leadId from array[0].id", async () => {
  setAmoEnv();
  logs.length = 0;
  const { fetchImpl, calls } = mockFetchSequence([
    () =>
      Response.json(
        [{ id: 9001, contact_id: 1, merged: false, request_id: ["r1"] }],
        { status: 200 }
      ),
    () => Response.json([{ id: 1 }], { status: 200 }),
  ]);
  const result = await createLeadInAmoCrm(rentalInput, fetchImpl);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.leadId, 9001);
    assert.equal(result.noteCreated, true);
  }
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/api\/v4\/leads\/complex$/);
  assert.match(calls[1].url, /\/api\/v4\/leads\/9001\/notes$/);
  const sent = JSON.parse(String(calls[0].init?.body));
  assert.ok(Array.isArray(sent));
  assert.equal(typeof sent[0].pipeline_id, "number");
  assert.equal(sent[0].tags_to_add[1].name, "аренда");
  assert.equal(sent[0]._embedded.contacts[0].first_name, "ТЕСТ САЙТА");
  assert.equal(
    sent[0]._embedded.contacts[0].custom_fields_values[0].values[0].enum_code,
    "WORK"
  );
});

await test("note failure after lead still returns success (partial)", async () => {
  setAmoEnv();
  const { fetchImpl, calls } = mockFetchSequence([
    () => Response.json([{ id: 9003 }], { status: 200 }),
    () => new Response("fail", { status: 500 }),
  ]);
  const result = await createLeadInAmoCrm(rentalInput, fetchImpl);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.leadId, 9003);
    assert.equal(result.noteCreated, false);
  }
  assert.equal(calls.length, 2);
});

await test("token only in Authorization; PII not in error logs", async () => {
  setAmoEnv({ AMOCRM_ACCESS_TOKEN: "secret-token-xyz" });
  logs.length = 0;
  const problem = {
    title: "Bad Request",
    type: "https://httpstatus.es/400",
    detail: "Validation failed",
    "validation-errors": [
      {
        request_id: "req-1",
        errors: [{ code: "FieldNotFound", path: ["0", "status_id"], field: "status_id" }],
      },
    ],
  };
  const { fetchImpl, calls } = mockFetchSequence([
    () =>
      new Response(JSON.stringify(problem), {
        status: 400,
        headers: { "Content-Type": "application/problem+json" },
      }),
  ]);
  const result = await createLeadInAmoCrm(rentalInput, fetchImpl);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "BAD_REQUEST");

  const auth = String(
    (calls[0].init?.headers as Record<string, string>)?.Authorization ?? ""
  );
  assert.equal(auth, "Bearer secret-token-xyz");

  const flat = JSON.stringify(logs);
  assert.ok(!flat.includes("secret-token-xyz"));
  assert.ok(!flat.includes("Bearer"));
  assert.ok(!flat.includes("+79812526969"));
  assert.ok(!flat.includes("секретный комментарий"));
  assert.ok(!flat.includes(rentalInput.name) || flat.includes("Bad Request"));
  // name might accidentally appear only if we wrongly logged payload — ensure not
  assert.ok(!flat.includes("ТЕСТ САЙТА"));
  assert.ok(flat.includes("400") || flat.includes("Bad Request"));
});

await test("extractSafeAmoError keeps only safe validation fields", () => {
  const safe = extractSafeAmoError({
    title: "Bad Request",
    detail: "Validation failed",
    type: "about:blank",
    "validation-errors": [
      {
        request_id: "abc",
        errors: [
          {
            code: "InvalidValue",
            path: ["0", "pipeline_id"],
            field: "pipeline_id",
            detail: "phone +79811234567 is wrong", // must not be forwarded as free text dump
          },
        ],
      },
    ],
  });
  assert.equal(safe.title, "Bad Request");
  assert.equal(safe.validationErrors[0].code, "InvalidValue");
  assert.equal(safe.validationErrors[0].path, "0.pipeline_id");
  assert.equal(safe.validationErrors[0].field, "pipeline_id");
  assert.equal(safe.validationErrors[0].request_id, "abc");
});

await test("401 returns safe error", async () => {
  setAmoEnv();
  const { fetchImpl } = mockFetchSequence([
    () => new Response("nope", { status: 401 }),
  ]);
  const result = await createLeadInAmoCrm(rentalInput, fetchImpl);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, "UNAUTHORIZED");
    assert.doesNotMatch(result.message, /token|amocrm|401|Bearer/i);
  }
});

await test("429 returns safe error", async () => {
  setAmoEnv();
  const { fetchImpl } = mockFetchSequence([
    () => new Response("slow", { status: 429 }),
  ]);
  const result = await createLeadInAmoCrm(rentalInput, fetchImpl);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "RATE_LIMITED");
});

await test("5xx returns safe error", async () => {
  setAmoEnv();
  const { fetchImpl } = mockFetchSequence([
    () => new Response("err", { status: 503 }),
  ]);
  const result = await createLeadInAmoCrm(rentalInput, fetchImpl);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "UPSTREAM_ERROR");
});

await test("missing env → NOT_CONFIGURED (no false success)", async () => {
  clearAmoEnv();
  assert.equal(getAmoCrmConfig(), null);
  const result = await createLeadInAmoCrm(rentalInput, async () => {
    throw new Error("fetch must not be called");
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, "NOT_CONFIGURED");
    assert.match(result.message, /настраивается/i);
  }
});

await test("certificate catalog and phone rules still hold", () => {
  const t = getCertificateTariff("weekday-60");
  assert.ok(t);
  assert.equal(t.price, 4990);
  assert.equal(getCertificateTariff("nope"), undefined);
  assert.equal(getCertificateTariff("weekend-180")?.price, 14000);
  const rejected = normalizeRuPhone("+49 30 123456");
  assert.equal(rejected.ok, false);
});

console.error = originalError;
restoreEnv();

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nAll amoCRM tests passed");
