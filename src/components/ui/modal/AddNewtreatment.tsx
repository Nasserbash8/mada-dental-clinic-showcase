"use client";
/**
 * AddTreatmentModal (abridged sample)
 * Creates a treatment: names, cost + currency, and the treated teeth.
 * The tooth selector can attach a custom treatment to individual teeth
 * (e.g. a group whitening plus a special note for one tooth).
 */
import React, { useState } from "react";
import Modal from ".";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import TeethSelector from "../teeth/teethSelector";
import { CURRENCY_OPTIONS, usePatientPatch } from "@/hooks/usePatientPatch";

interface Tooth { id: string; value: string; customTreatment?: string }

interface Props { isOpen: boolean; onClose: () => void; patientId: string }

export default function AddTreatmentModal({ isOpen, onClose, patientId }: Props) {
  const [form, setForm] = useState({
    treatmentNames: [] as { name: string }[],
    cost: 0,
    currency: "SYP",
    teeth: [] as Tooth[],
    sessions: [] as unknown[],
  });
  const { errors, saving, save } = usePatientPatch(patientId, onClose);

  // The selector reports the selected teeth plus any per-tooth custom text; merge them here.
  const onTeeth = (
    selected: Tooth[],
    custom?: { id: string; customTreatment: string }[]
  ) =>
    setForm((p) => ({
      ...p,
      teeth: selected.map((t) => {
        const c = custom?.find((x) => x.id === t.id);
        return c ? { ...t, customTreatment: c.customTreatment } : t;
      }),
    }));

  const submit = () =>
    save(
      () => ({
        ...(form.treatmentNames.length ? {} : { treatmentNames: "Treatment name is required" }),
        ...(form.cost ? {} : { cost: "Cost is required" }),
        ...(form.teeth.length ? {} : { teeth: "Please select teeth" }),
      }),
      { newTreatmentData: form }
    );

  return (
    <Modal isFullscreen isOpen={isOpen} onClose={onClose}>
      <div className="p-4 max-h-[80vh] overflow-y-auto">
        <h4 className="text-xl font-semibold mb-4">Add New Treatment</h4>

        <Label>Treatment Names</Label>
        <Input
          value={form.treatmentNames.map((n) => n.name).join(" - ")}
          // "A - B" in the input becomes [{name:"A"},{name:"B"}]
          onChange={(e) =>
            setForm({ ...form, treatmentNames: e.target.value.split("-").map((n) => ({ name: n.trim() })) })
          }
          placeholder="e.g. Filling - Root Canal"
        />
        {errors.treatmentNames && <p className="text-red-500 text-sm">{errors.treatmentNames}</p>}

        <Label>Cost and Currency</Label>
        <div className="flex gap-2 items-center mb-1">
          <div className="flex-[3]">
            <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
          </div>
          <div className="flex-1 min-w-[120px]">
            <Select
              options={CURRENCY_OPTIONS}
              defaultValue={form.currency}
              onChange={(v) => setForm({ ...form, currency: v })}
            />
          </div>
        </div>
        {errors.cost && <p className="text-red-500 text-sm">{errors.cost}</p>}

        <TeethSelector initialSelected={[]} enableCustomTreatments onSelectionChange={onTeeth} />
        {errors.teeth && <p className="text-red-500 text-sm">{errors.teeth}</p>}

        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </Modal>
  );
}
