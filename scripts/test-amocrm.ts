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
  getAmoCrmConfig,
  type AmoCrmConfig,
  type BoatRentalLeadInput,
  type GiftCertificateLeadInput,
} from "../lib/amocrm.ts";

let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => console.log(`✓ ${name}`))
    .catch((err) => {
      failed++;
      console.error(`✗ ${name}`);
      console.error(err);
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
  process.env.AMOCRM_PIPELINE_ID = "111";
  process.env.AMOCRM_STATUS_ID = "222";
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
  comment: "тест",
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

await test("config reads pipeline/status from env", () => {
  setAmoEnv();
  const cfg = getAmoCrmConfig();
  assert.ok(cfg);
  assert.equal(cfg.pipelineId, 111);
  assert.equal(cfg.statusId, 222);
  assert.equal(cfg.baseUrl, "https://example.amocrm.ru");
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

await test("complex payload: contact phone, tags, pipeline from env", () => {
  setAmoEnv();
  const cfg = getAmoCrmConfig() as AmoCrmConfig;
  const body = buildComplexLeadPayload(cfg, rentalInput);
  assert.equal(body[0].pipeline_id, 111);
  assert.equal(body[0].status_id, 222);
  assert.deepEqual(
    body[0]._embedded.tags.map((t) => t.name),
    ["сайт", "аренда"]
  );
  const phoneField =
    body[0]._embedded.contacts[0].custom_fields_values[0];
  assert.equal(phoneField.field_code, "PHONE");
  assert.equal(phoneField.values[0].value, "+79812526969");
  assert.ok(phoneField.values[0].value.startsWith("+7"));
});

await test("certificate note uses server price label", () => {
  const note = buildNoteText(certInput);
  assert.match(note, /Тип заявки: Подарочный сертификат/);
  assert.match(note, new RegExp(certTariff.priceLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(note, /client.?price/i);
});

await test("rental creates lead + note via mock", async () => {
  setAmoEnv();
  const { fetchImpl, calls } = mockFetchSequence([
    () =>
      Response.json([{ id: 9001, contact_id: 1 }], { status: 200 }),
    () => Response.json([{ id: 1 }], { status: 200 }),
  ]);
  const result = await createLeadInAmoCrm(rentalInput, fetchImpl);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.leadId, 9001);
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/api\/v4\/leads\/complex$/);
  assert.match(calls[1].url, /\/api\/v4\/leads\/9001\/notes$/);
  const auth = String(
    (calls[0].init?.headers as Record<string, string>)?.Authorization ?? ""
  );
  assert.equal(auth, "Bearer test-token-value");
  const sent = JSON.parse(String(calls[0].init?.body));
  assert.equal(sent[0]._embedded.tags[1].name, "аренда");
  assert.equal(
    sent[0]._embedded.contacts[0].custom_fields_values[0].values[0].value,
    "+79812526969"
  );
});

await test("certificate creates lead with certificate tag", async () => {
  setAmoEnv();
  const { fetchImpl, calls } = mockFetchSequence([
    () => Response.json([{ id: 9002 }], { status: 200 }),
    () => Response.json([{ id: 2 }], { status: 200 }),
  ]);
  const result = await createLeadInAmoCrm(certInput, fetchImpl);
  assert.equal(result.ok, true);
  const sent = JSON.parse(String(calls[0].init?.body));
  assert.equal(sent[0]._embedded.tags[1].name, "подарочный сертификат");
  const note = JSON.parse(String(calls[1].init?.body));
  assert.match(note[0].params.text, /Цена \(сервер\):/);
  assert.match(note[0].params.text, new RegExp(certTariff.priceLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

await test("token only in Authorization header", async () => {
  setAmoEnv({ AMOCRM_ACCESS_TOKEN: "secret-token-xyz" });
  const { fetchImpl, calls } = mockFetchSequence([
    () => Response.json([{ id: 1 }], { status: 200 }),
    () => Response.json([{ id: 1 }], { status: 200 }),
  ]);
  await createLeadInAmoCrm(rentalInput, fetchImpl);
  for (const call of calls) {
    const headers = call.init?.headers as Record<string, string>;
    assert.equal(headers.Authorization, "Bearer secret-token-xyz");
    assert.equal(headers["Content-Type"], "application/json");
    assert.ok(!String(call.init?.body).includes("secret-token-xyz"));
    assert.ok(!call.url.includes("secret-token-xyz"));
  }
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
  if (!result.ok) {
    assert.equal(result.code, "RATE_LIMITED");
    assert.doesNotMatch(result.message, /token|pipeline|status_id/i);
  }
});

await test("5xx returns safe error", async () => {
  setAmoEnv();
  const { fetchImpl } = mockFetchSequence([
    () => new Response("err", { status: 503 }),
  ]);
  const result = await createLeadInAmoCrm(rentalInput, fetchImpl);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, "UPSTREAM_ERROR");
    assert.match(result.message, /свяжитесь/i);
  }
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
  // client price must never be trusted — only tariff id → server price
  assert.equal(getCertificateTariff("weekend-180")?.price, 14000);
  const rejected = normalizeRuPhone("+49 30 123456");
  assert.equal(rejected.ok, false);
});

restoreEnv();

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nAll amoCRM tests passed");
