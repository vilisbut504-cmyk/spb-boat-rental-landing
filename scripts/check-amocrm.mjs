#!/usr/bin/env node
/**
 * Diagnose amoCRM env + account access. Never prints the access token.
 *
 * Usage: npm run check:amocrm
 * Requires: AMOCRM_BASE_URL, AMOCRM_ACCESS_TOKEN, AMOCRM_PIPELINE_ID, AMOCRM_STATUS_ID
 */

const TIMEOUT_MS = 15_000;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function readConfig() {
  const baseUrl = (process.env.AMOCRM_BASE_URL ?? "").trim().replace(/\/$/, "");
  const accessToken = (process.env.AMOCRM_ACCESS_TOKEN ?? "").trim();
  const pipelineId = Number((process.env.AMOCRM_PIPELINE_ID ?? "").trim());
  const statusId = Number((process.env.AMOCRM_STATUS_ID ?? "").trim());

  const missing = [];
  if (!baseUrl) missing.push("AMOCRM_BASE_URL");
  if (!accessToken) missing.push("AMOCRM_ACCESS_TOKEN");
  if (!Number.isInteger(pipelineId) || pipelineId <= 0) {
    missing.push("AMOCRM_PIPELINE_ID");
  }
  if (!Number.isInteger(statusId) || statusId <= 0) {
    missing.push("AMOCRM_STATUS_ID");
  }
  if (missing.length) {
    fail(`Missing or invalid env: ${missing.join(", ")}`);
  }
  if (!/^https:\/\//i.test(baseUrl)) {
    fail("AMOCRM_BASE_URL must use https://");
  }
  let host = "";
  try {
    host = new URL(baseUrl).host.toLowerCase();
  } catch {
    fail("AMOCRM_BASE_URL is not a valid URL");
  }
  const hostOk =
    host.endsWith(".amocrm.ru") ||
    host === "amocrm.ru" ||
    host.endsWith(".kommo.com") ||
    host === "kommo.com";
  if (!hostOk) {
    fail("AMOCRM_BASE_URL host must be *.amocrm.ru or *.kommo.com");
  }

  return { baseUrl, accessToken, pipelineId, statusId };
}

async function amoGet(baseUrl, accessToken, path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const config = readConfig();
  ok(`Base URL host: ${new URL(config.baseUrl).host}`);
  ok(`Configured pipeline_id=${config.pipelineId}, status_id=${config.statusId}`);

  const accountRes = await amoGet(
    config.baseUrl,
    config.accessToken,
    "/api/v4/account"
  );
  if (accountRes.status === 401 || accountRes.status === 403) {
    fail(`Account request unauthorized (HTTP ${accountRes.status})`);
  }
  if (!accountRes.ok) {
    fail(`Account request failed (HTTP ${accountRes.status})`);
  }
  const account = await accountRes.json();
  const accountName = account?.name ?? account?.id ?? "ok";
  ok(`Account reachable (${accountName})`);

  const pipelinesRes = await amoGet(
    config.baseUrl,
    config.accessToken,
    "/api/v4/leads/pipelines"
  );
  if (!pipelinesRes.ok) {
    fail(`Pipelines request failed (HTTP ${pipelinesRes.status})`);
  }
  const pipelinesJson = await pipelinesRes.json();
  const pipelines = pipelinesJson?._embedded?.pipelines ?? [];
  if (!Array.isArray(pipelines) || pipelines.length === 0) {
    fail("No pipelines returned");
  }

  console.log("\nPipelines / statuses:");
  let pipelineFound = false;
  let statusFound = false;

  for (const pipeline of pipelines) {
    const mark =
      Number(pipeline.id) === config.pipelineId ? " ← selected pipeline" : "";
    console.log(`  • ${pipeline.name} (id=${pipeline.id})${mark}`);
    if (Number(pipeline.id) === config.pipelineId) pipelineFound = true;

    const statuses = pipeline?._embedded?.statuses ?? [];
    for (const status of statuses) {
      const smark =
        Number(pipeline.id) === config.pipelineId &&
        Number(status.id) === config.statusId
          ? " ← selected status"
          : "";
      console.log(`      - ${status.name} (id=${status.id})${smark}`);
      if (
        Number(pipeline.id) === config.pipelineId &&
        Number(status.id) === config.statusId
      ) {
        statusFound = true;
      }
    }
  }

  console.log("");
  if (!pipelineFound) {
    fail(
      `AMOCRM_PIPELINE_ID=${config.pipelineId} was not found in account pipelines`
    );
  }
  ok(`Pipeline id ${config.pipelineId} exists`);

  if (!statusFound) {
    fail(
      `AMOCRM_STATUS_ID=${config.statusId} was not found inside pipeline ${config.pipelineId}`
    );
  }
  ok(`Status id ${config.statusId} exists in the selected pipeline`);
  console.log("\nDiagnosis OK — safe to send a test lead.");
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : "Unexpected error");
});
