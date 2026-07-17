/**
 * Phone normalizer test table. Run with: node scripts/test-phone.ts
 * (Node 22.6+ type stripping; no extra deps.)
 */
import {
  normalizeRuPhone,
  formatRuPhoneDisplay,
  PHONE_TEST_CASES,
} from "../lib/phone.ts";

let failed = 0;

for (const { input, expected } of PHONE_TEST_CASES) {
  const result = normalizeRuPhone(input);
  const actual = result.ok ? result.canonical : null;
  const pass = actual === expected;
  if (!pass) failed++;
  console.log(
    `${pass ? "✓" : "✗"} ${JSON.stringify(input)} → ${actual ?? "REJECTED"} (expected ${expected ?? "REJECTED"})`
  );
}

const display = formatRuPhoneDisplay("+79812526969");
const displayOk = display === "+7 981 252-69-69";
if (!displayOk) failed++;
console.log(`${displayOk ? "✓" : "✗"} display "+79812526969" → "${display}"`);

if (failed > 0) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${PHONE_TEST_CASES.length + 1} cases passed`);
