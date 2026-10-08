'use client'
/**
 * TeethSelector (abridged sample)
 * Multi-select of teeth/groups plus an optional editor for per-tooth custom
 * treatments. All state lives in `useTeethLogic`; this component only renders it.
 */
import React from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2 } from "lucide-react";
import teethData from "../../../../public/multiOptions/teeth.json";
import { useTeethLogic } from "@/hooks/useTeethLogic";

const MultiSelect = dynamic(() => import("@/components/form/MultiSelect"));

interface Tooth { id: string; value: string }
interface CustomTreatment extends Tooth { customTreatment: string }

interface Props {
  onSelectionChange: (selected: Tooth[], custom: CustomTreatment[]) => void;
  initialSelected?: Tooth[];
  enableCustomTreatments?: boolean;
}

const TeethSelector: React.FC<Props> = ({ onSelectionChange, initialSelected = [], enableCustomTreatments = false }) => {
  const { selectedTeeth, customTreatments, handleTeethChange, addCustomTreatment, updateCustomTreatment, removeCustomTreatment } =
    useTeethLogic(initialSelected, onSelectionChange);

  return (
    <div className="space-y-4">
      <MultiSelect
        label="Select Teeth"
        options={teethData}
        defaultSelected={initialSelected.map((t) => t.id)}
        onChange={handleTeethChange}
      />

      {enableCustomTreatments && selectedTeeth.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <button type="button" onClick={addCustomTreatment} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md text-sm">
            <Plus size={16} /> Add custom treatment per tooth
          </button>

          {customTreatments.map((item, i) => (
            <div key={i} className="grid md:grid-cols-12 gap-3 items-end mt-4 p-3 bg-white rounded-md border">
              <select className="md:col-span-4 border p-2 rounded text-sm" value={item.id} onChange={(e) => updateCustomTreatment(i, "id", e.target.value)}>
                {selectedTeeth.map((t) => (
                  // A tooth can have only one custom treatment, so already-used teeth are disabled.
                  <option key={t.id} value={t.id} disabled={customTreatments.some((c, j) => c.id === t.id && j !== i)}>
                    {t.value}
                  </option>
                ))}
              </select>
              <input
                className="md:col-span-7 border p-2 rounded text-sm"
                value={item.customTreatment}
                onChange={(e) => updateCustomTreatment(i, "customTreatment", e.target.value)}
                placeholder="e.g. Root canal, extraction..."
              />
              <button type="button" onClick={() => removeCustomTreatment(i)} className="md:col-span-1 p-2 text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeethSelector;
