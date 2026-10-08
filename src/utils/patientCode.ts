/**
 * Patient access code helpers (abridged sample).
 *
 * Patients sign in with a short code written on the clinic card instead of a
 * password. The card also carries a QR code that opens the login page, so the
 * patient only has to type the code.
 *
 * Format: two letters, a dash, four digits - e.g. "AB-1234".
 */

const CODE_PATTERN = /^[A-Z]{2}-\d{4}$/;

/** Normalises what a person might type: lower-case, spaces, missing dash, Arabic-Indic digits. */
export function normalizeCode(raw: string): string {
  const latinDigits = raw.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  const compact = latinDigits.replace(/[\s_-]/g, "").toUpperCase();
  return compact.length === 6 ? `${compact.slice(0, 2)}-${compact.slice(2)}` : compact;
}

export function isValidCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}

/**
 * Creates a candidate code. Uniqueness is enforced by the caller
 * (retry on collision), which keeps this helper free of any storage logic.
 */
export function generateCode(random: () => number = Math.random): string {
  const letters = Array.from({ length: 2 }, () =>
    String.fromCharCode(65 + Math.floor(random() * 26))
  ).join("");
  const digits = String(Math.floor(random() * 10000)).padStart(4, "0");
  return `${letters}-${digits}`;
}
