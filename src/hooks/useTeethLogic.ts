import { useState, useCallback } from "react";
import teethData from "../../public/multiOptions/teeth.json";
import { expandToothIds } from "@/utils/toothGroups";

interface Tooth {
  id: string;
  value: string;
}

interface CustomTreatment extends Tooth {
  customTreatment: string;
}

/**
 * useTeethLogic (abridged sample)
 * State machine behind the tooth selector:
 *  - the doctor picks teeth or whole groups,
 *  - groups are expanded into single teeth,
 *  - optional custom treatments can be attached to individual selected teeth.
 * Every change is reported to the parent through `onSelectionChange`.
 */
export const useTeethLogic = (
  initialTeeth: Tooth[] = [],
  onSelectionChange: (selectedTeeth: Tooth[], customTreatments: CustomTreatment[]) => void
) => {
  const [selectedTeeth, setSelectedTeeth] = useState<Tooth[]>(initialTeeth);
  const [customTreatments, setCustomTreatments] = useState<CustomTreatment[]>([]);

  /** Expand groups, then drop custom treatments of teeth that are no longer selected. */
  const handleTeethChange = useCallback(
    (values: Tooth[]) => {
      const ids = expandToothIds(values.map((v) => v.id));
      const teeth = ids.map((id) => teethData.find((t) => t.id === id) ?? { id, value: id });
      const custom = customTreatments.filter((c) => ids.includes(c.id));

      setSelectedTeeth(teeth);
      setCustomTreatments(custom);
      onSelectionChange(teeth, custom);
    },
    [customTreatments, onSelectionChange]
  );

  /** Small helper so every custom-treatment change updates state AND notifies the parent. */
  const commit = (next: CustomTreatment[]) => {
    setCustomTreatments(next);
    onSelectionChange(selectedTeeth, next);
  };

  /** New entry for the first selected tooth that has no custom treatment yet. */
  const addCustomTreatment = () => {
    const free = selectedTeeth.find((t) => !customTreatments.some((c) => c.id === t.id));
    if (free) commit([...customTreatments, { ...free, customTreatment: "" }]);
  };

  /** Change either the target tooth or the text of one entry. */
  const updateCustomTreatment = (index: number, field: "id" | "customTreatment", value: string) => {
    commit(
      customTreatments.map((c, i) => {
        if (i !== index) return c;
        if (field === "customTreatment") return { ...c, customTreatment: value };
        const tooth = selectedTeeth.find((t) => t.id === value);
        return tooth ? { ...tooth, customTreatment: c.customTreatment } : c;
      })
    );
  };

  const removeCustomTreatment = (index: number) => commit(customTreatments.filter((_, i) => i !== index));

  return { selectedTeeth, customTreatments, handleTeethChange, addCustomTreatment, updateCustomTreatment, removeCustomTreatment };
};
