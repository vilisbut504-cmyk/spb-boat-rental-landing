/**
 * Single source of truth for Russian phone normalization.
 * Used by both the booking form (client) and /api/lead (server).
 *
 * Canonical format: +7XXXXXXXXXX (exactly "+7" + 10 digits).
 */

export type PhoneResult =
  | { ok: true; canonical: string }
  | { ok: false; error: string };

const CANONICAL_RE = /^\+7\d{10}$/;
const MOBILE_RE = /^\+79\d{9}$/;

export function normalizeRuPhone(raw: string): PhoneResult {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return { ok: false, error: "Укажите телефон" };
  }

  // Formatting characters are allowed; letters are not.
  if (/[A-Za-zА-Яа-яЁё]/.test(trimmed)) {
    return { ok: false, error: "Укажите российский мобильный номер" };
  }

  // Reject explicit foreign prefixes like +49..., +1... (a leading "+" must be +7)
  if (trimmed.startsWith("+") && !trimmed.startsWith("+7")) {
    return { ok: false, error: "Укажите российский номер, начинающийся с +7" };
  }

  const digits = trimmed.replace(/\D/g, "");

  let canonical: string | null = null;
  if (digits.length === 11 && digits.startsWith("8")) {
    canonical = `+7${digits.slice(1)}`;
  } else if (digits.length === 11 && digits.startsWith("7")) {
    canonical = `+${digits}`;
  } else if (digits.length === 10 && digits.startsWith("9")) {
    canonical = `+7${digits}`;
  }

  if (
    !canonical ||
    !CANONICAL_RE.test(canonical) ||
    !MOBILE_RE.test(canonical)
  ) {
    return {
      ok: false,
      error: "Укажите корректный российский номер из 10 цифр",
    };
  }

  return { ok: true, canonical };
}

/** "+79812526969" → "+7 981 252-69-69" for display after blur. */
export function formatRuPhoneDisplay(canonical: string): string {
  if (!CANONICAL_RE.test(canonical)) return canonical;
  const d = canonical.slice(2);
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
}

/**
 * Verifiable case table — used by scripts/test-phone.ts and kept next to the
 * implementation so the rules stay documented.
 */
export const PHONE_TEST_CASES: {
  input: string;
  expected: string | null;
}[] = [
  { input: "89812526969", expected: "+79812526969" },
  { input: "79812526969", expected: "+79812526969" },
  { input: "9812526969", expected: "+79812526969" },
  { input: "+79812526969", expected: "+79812526969" },
  { input: "+7 (981) 252-69-69", expected: "+79812526969" },
  { input: "8 (981) 252-69-69", expected: "+79812526969" },
  { input: "8 981 252 69 69", expected: "+79812526969" },
  { input: "8-981-252-69-69", expected: "+79812526969" },
  // invalid
  { input: "", expected: null },
  { input: "981252", expected: null },
  { input: "98125269", expected: null },
  { input: "+49 30 123456", expected: null },
  { input: "123456789012", expected: null },
  { input: "abc", expected: null },
  { input: "abc9812526969", expected: null },
  { input: "8123456789", expected: null },
  { input: "71234567890", expected: null },
  { input: "81234567890", expected: null },
  { input: "8981252696", expected: null }, // 10 digits starting with 8 — treated as an incomplete 11-digit number
  { input: "7981252696", expected: null }, // 10 digits starting with 7 — same
];
