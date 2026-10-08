/** Converts Arabic-Indic digits (٠-٩) to Latin digits so phone numbers are stored in one format. */
export function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}
