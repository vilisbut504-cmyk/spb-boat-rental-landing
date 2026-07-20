#!/usr/bin/env node
/**
 * Diagnose amoCRM connection and list pipeline / status IDs.
 * Never prints the access token or Authorization header.
 *
 * Required:  AMOCRM_BASE_URL, AMOCRM_ACCESS_TOKEN
 * Optional:  AMOCRM_PIPELINE_ID, AMOCRM_STATUS_ID (validated if set)
 *
 * Usage: npm run check:amocrm
 */

const TIMEOUT_MS = 15_000;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function readOptionalId(raw) {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  const id = Number(trimmed);
  if (!Number.isInteger(id) || id <= 0) {
    fail(`Invalid numeric id: ${trimmed}`);
  }
  return id;
}

function readConfig() {
  const baseUrl = (process.env.AMOCRM_BASE_URL ?? "").trim().replace(/\/$/, "");
  const accessToken = (process.env.AMOCRM_ACCESS_TOKEN ?? "").trim();

  const missing = [];
  if (!baseUrl) missing.push("AMOCRM_BASE_URL");
  if (!accessToken) missing.push("AMOCRM_ACCESS_TOKEN");
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

  const pipelineId = readOptionalId(process.env.AMOCRM_PIPELINE_ID);
  const statusId = readOptionalId(process.env.AMOCRM_STATUS_ID);

  return { baseUrl, accessToken, pipelineId, statusId };
}

async function amoGet(baseUrl, accessToken, path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchStatuses(baseUrl, accessToken, pipelineId, embeddedFallback) {
  const res = await amoGet(
    baseUrl,
    accessToken,
    `/api/v4/leads/pipelines/${pipelineId}/statuses`
  );

  if (res.ok) {
    const json = await res.json();
    const list = json?._embedded?.statuses;
    if (Array.isArray(list)) return list;
  }

  // Fallback: statuses often already come embedded in the pipelines list.
  if (Array.isArray(embeddedFallback) && embeddedFallback.length > 0) {
    if (!res.ok) {
      console.log(
        `  (statuses endpoint HTTP ${res.status} — using embedded list)`
      );
    }
    return embeddedFallback;
  }

  if (!res.ok) {
    fail(
      `Statuses request failed for pipeline ${pipelineId} (HTTP ${res.status})`
    );
  }
  return [];
}

async function main() {
  const config = readConfig();
  ok(`Base URL host: ${new URL(config.baseUrl).host}`);
  if (config.pipelineId != null || config.statusId != null) {
    ok(
      `Optional check: PIPELINE_ID=${config.pipelineId ?? "—"}, STATUS_ID=${config.statusId ?? "—"}`
    );
  } else {
    ok("PIPELINE_ID / STATUS_ID not set — listing available IDs");
  }

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

  console.log("\n── Воронки и этапы ──\n");

  let pipelineFound = false;
  let statusFound = false;

  for (const pipeline of pipelines) {
    const pid = Number(pipeline.id);
    const selectedPipeline = config.pipelineId != null && pid === config.pipelineId;
    if (selectedPipeline) pipelineFound = true;

    console.log(`Воронка: ${pipeline.name}${selectedPipeline ? "  ← selected" : ""}`);
    console.log(`AMOCRM_PIPELINE_ID=${pid}`);
    console.log("");

    const statuses = await fetchStatuses(
      config.baseUrl,
      config.accessToken,
      pid,
      pipeline?._embedded?.statuses
    );

    if (!Array.isArray(statuses) || statuses.length === 0) {
      console.log("  (этапы не найдены)\n");
      continue;
    }

    for (const status of statuses) {
      const sid = Number(status.id);
      const selectedStatus =
        selectedPipeline &&
        config.statusId != null &&
        sid === config.statusId;
      if (selectedStatus) statusFound = true;

      console.log(
        `  Этап: ${status.name}${selectedStatus ? "  ← selected" : ""}`
      );
      console.log(`  AMOCRM_STATUS_ID=${sid}`);
      console.log("");
    }
  }

  if (config.pipelineId != null) {
    if (!pipelineFound) {
      fail(
        `AMOCRM_PIPELINE_ID=${config.pipelineId} was not found in account pipelines`
      );
    }
    ok(`Configured pipeline id ${config.pipelineId} exists`);
  }

  if (config.statusId != null) {
    if (config.pipelineId == null) {
      fail(
        "AMOCRM_STATUS_ID is set, but AMOCRM_PIPELINE_ID is missing — set both to validate the pair"
      );
    }
    if (!statusFound) {
      fail(
        `AMOCRM_STATUS_ID=${config.statusId} was not found inside pipeline ${config.pipelineId}`
      );
    }
    ok(
      `Configured status id ${config.statusId} exists in pipeline ${config.pipelineId}`
    );
  }

  console.log("\nDiagnosis OK.");
  if (config.pipelineId == null || config.statusId == null) {
    console.log(
      "Pick AMOCRM_PIPELINE_ID and AMOCRM_STATUS_ID from the list above, then set them in the server env for live lead delivery."
    );
  } else {
    console.log("Configured pipeline/status pair is valid — safe to send a test lead.");
  }
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : "Unexpected error");
});
