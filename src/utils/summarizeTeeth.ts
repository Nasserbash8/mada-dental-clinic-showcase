/**
 * summarizeTeeth - turns a list of treated teeth into short, readable labels (abridged sample).
 *
 * "All 8 teeth of the upper-right quadrant" is shown as ONE label instead of
 * eight, and a custom per-tooth note stays visible next to its tooth.
 */
export interface TreatedTooth {
  id: string;
  value: string; // display name
  customTreatment?: string;
}

export interface TeethLabel {
  key: string;
  text: string;
  group: boolean; // true for "whole quadrant" style labels
  custom?: string; // custom per-tooth note
}

// Group definitions (shortened in this sample; the real map covers every quadrant and "smile" group).
const GROUPS: Record<string, { label: string; ids: string[] }> = {
  // e.g. UPPER_RIGHT: { label: "Full Upper Right", ids: ["RU1", "RU2", ...] },
};

export function summarizeTeeth(teeth: TreatedTooth[]): TeethLabel[] {
  const present = new Set(teeth.map((t) => t.id));
  const covered = new Set<string>();
  const labels: TeethLabel[] = [];

  // 1) A group is shown only when ALL of its teeth are part of the treatment.
  for (const [key, g] of Object.entries(GROUPS)) {
    if (g.ids.every((id) => present.has(id)) && !g.ids.every((id) => covered.has(id))) {
      labels.push({ key, text: g.label, group: true });
      g.ids.forEach((id) => covered.add(id));
    }
  }

  // 2) Remaining teeth are listed one by one; covered teeth reappear only if they carry a custom note.
  for (const t of teeth) {
    const custom = t.customTreatment?.trim();
    if (!covered.has(t.id) || custom) {
      labels.push({
        key: t.id,
        text: covered.has(t.id) ? `Edit on ${t.value}` : t.value,
        group: false,
        custom: custom || undefined,
      });
    }
  }
  return labels;
}
