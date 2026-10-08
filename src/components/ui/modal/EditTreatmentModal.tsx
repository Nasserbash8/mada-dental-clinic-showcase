'use client';
/**
 * EditTreatmentModal (abridged sample)
 * Edits a treatment: names, cost + currency and the treated teeth.
 *  - Picking a whole group (e.g. an arch) expands to its individual teeth.
 *  - Existing per-tooth custom text is preserved when the selection changes.
 */
import React, { useEffect, useState } from 'react';
import Modal from '.';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Button from '../button/Button';
import { CURRENCY_OPTIONS, usePatientPatch } from '@/hooks/usePatientPatch';

interface Tooth { id: string; value: string; customTreatment?: string }

interface Treatment {
  treatmentId: string;
  treatmentNames: { name: string }[];
  cost: number;
  currency: string;
  teeth: Tooth[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  treatment: Treatment;
  onSave: () => void;
  teethData: Tooth[];
}

// Group id -> member tooth ids (shortened here; the real map lists every tooth of each arch).
const toothGroups: Record<string, string[]> = {
  /* e.g. UPPER_LEFT: ['UL1', 'UL2', ...] */
};

export default function EditTreatmentModal({ isOpen, onClose, patientId, treatment, onSave, teethData }: Props) {
  const [form, setForm] = useState<Treatment>(treatment);
  const { errors, saving, save } = usePatientPatch(patientId, () => { onClose(); onSave(); });

  useEffect(() => setForm(treatment), [treatment]);

  /** Expand groups, drop duplicates and keep any custom text already written. */
  const onTeethChange = (selectedIds: string[]) => {
    const ids = Array.from(new Set(selectedIds.flatMap((id) => toothGroups[id] || [id])));
    const previous = new Map(form.teeth.map((t) => [t.id, t]));
    setForm((p) => ({
      ...p,
      teeth: ids.map(
        (id) => previous.get(id) ?? { id, value: teethData.find((t) => t.id === id)?.value ?? id, customTreatment: '' }
      ),
    }));
  };

  const setCustom = (index: number, text: string) =>
    setForm((p) => ({ ...p, teeth: p.teeth.map((t, i) => (i === index ? { ...t, customTreatment: text } : t)) }));

  const submit = () =>
    save(
      () => ({
        ...(form.treatmentNames.length ? {} : { treatmentNames: 'Treatment name is required' }),
        ...(form.cost ? {} : { cost: 'Cost is required' }),
        ...(form.teeth.length ? {} : { teeth: 'Please select teeth' }),
      }),
      { treatmentId: form.treatmentId, updateTreatmentData: form } // currency travels with the treatment
    );

  return (
    <Modal isFullscreen isOpen={isOpen} onClose={onClose}>
      <div className="p-4 max-h-[80vh] overflow-y-auto">
        <h4 className="text-xl font-semibold mb-4">Edit Treatment</h4>

        <Label>Treatment Names</Label>
        <Input
          value={form.treatmentNames.map((n) => n.name).join(' - ')}
          onChange={(e) =>
            setForm({ ...form, treatmentNames: e.target.value.split('-').map((n) => ({ name: n.trim() })) })
          }
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

        {/* Teeth multi-select (a richer component is used in the full version) */}
        <Label>Teeth</Label>
        <select
          multiple
          className="w-full rounded border p-2 mb-1"
          value={form.teeth.map((t) => t.id)}
          onChange={(e) => onTeethChange(Array.from(e.target.selectedOptions, (o) => o.value))}
        >
          {teethData.map((t) => (
            <option key={t.id} value={t.id}>{t.value}</option>
          ))}
        </select>
        {errors.teeth && <p className="text-red-500 text-sm">{errors.teeth}</p>}

        {/* Per-tooth custom treatment: only meaningful when several teeth share one treatment */}
        {form.teeth.length > 1 && (
          <>
            <Label>Custom Treatment per Tooth</Label>
            {form.teeth.map((tooth, i) => (
              <div key={tooth.id} className="flex items-center gap-4 mb-2">
                <span className="w-24">{tooth.value}</span>
                <Input
                  placeholder="e.g., Deep Cleaning"
                  value={tooth.customTreatment || ''}
                  onChange={(e) => setCustom(i, e.target.value)}
                />
              </div>
            ))}
          </>
        )}

        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </Modal>
  );
}
