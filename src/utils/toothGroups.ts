/**
 * Tooth groups - single source of truth (abridged sample).
 *
 * The dental chart uses ids such as "<quadrant><number>" (4 quadrants x 8 teeth).
 * A selection can also be a SHORTHAND group id: a whole quadrant ("...A") or a
 * "smile" group (the front 6/8/10 teeth of an arch). Shorthands are expanded to
 * single teeth before anything is saved, and the same table is used by the
 * selector, the dental map and the labels.
 */
const range = (quadrant: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${quadrant}${from + i}`);

/** Front teeth of an arch: the first `n/2` teeth of each side. */
const smile = (upper: boolean, n: number) => {
  const [l, r] = upper ? ["LU", "RU"] : ["LD", "RD"];
  return [...range(l, 1, n / 2), ...range(r, 1, n / 2)];
};

export const TOOTH_GROUPS: Record<string, string[]> = {
  // Whole quadrants (upper/lower, left/right)
  LUA: range("LU", 1, 8),
  RUA: range("RU", 1, 8),
  LDA: range("LD", 1, 8),
  RDA: range("RD", 1, 8),
  // Smile groups
  U6: smile(true, 6),
  U8: smile(true, 8),
  U10: smile(true, 10),
  D6: smile(false, 6),
  D8: smile(false, 8),
  D10: smile(false, 10),
};

export const SMILE_GROUPS = Object.fromEntries(
  Object.entries(TOOTH_GROUPS).filter(([id]) => /^[UD]\d+$/.test(id))
);

/** Expands any mix of group ids and tooth ids into a de-duplicated list of tooth ids. */
export const expandToothIds = (ids: string[]) =>
  Array.from(new Set(ids.flatMap((id) => TOOTH_GROUPS[id] ?? [id])));
