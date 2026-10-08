'use client';
/**
 * AddSessionModal (abridged sample)
 * Adds a session to one treatment: session date + payment amount + the
 * currency of THAT payment + payment date.
 * Saving is delegated to the shared `usePatientPatch` hook.
 */
import React, { useState } from 'react';
import Modal from '.';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import DatePicker from '@/components/form/date-picker';
import Button from '../button/Button';
import { CURRENCY_OPTIONS, usePatientPatch, type FieldErrors } from '@/hooks/usePatientPatch';

type Props = { isOpen: boolean; onClose: () => void; patientId: string; treatmentId: string };

export default function AddSessionModal({ isOpen, onClose, patientId, treatmentId }: Props) {
  const [form, setForm] = useState({
    sessionDate: new Date(),
    Payments: '',
    paymentCurrency: 'SYP', // chosen per payment, independent of the treatment currency
    PaymentsDate: new Date(),
  });
  const set = (field: keyof typeof form, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const { errors, saving, save } = usePatientPatch(patientId, onClose);

  const submit = () =>
    save(
      () => (form.Payments ? {} : { Payments: 'Payment amount is required' }) as FieldErrors,
      { treatmentId, newSessionData: form } // sparse body: only the new session
    );

  return (
    <Modal isFullscreen isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h4 className="text-xl font-semibold mb-4">Add Treatment Session</h4>

        <DatePicker
          id="session-date"
          label="Session Date"
          value={[form.sessionDate]}
          onChange={(d) => set('sessionDate', d[0])}
        />

        {/* Amount and currency sit side by side so the pair reads as one value */}
        <Label>Payment and Currency</Label>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-grow">
            <Input value={form.Payments} onChange={(e) => set('Payments', e.target.value)} placeholder="Amount" />
          </div>
          <div className="w-36">
            <Select
              options={CURRENCY_OPTIONS}
              defaultValue={form.paymentCurrency}
              onChange={(v) => set('paymentCurrency', v)}
            />
          </div>
        </div>
        {errors.Payments && <p className="text-red-500 text-sm">{errors.Payments}</p>}

        <DatePicker
          id="payments-date"
          label="Payment Date"
          value={[form.PaymentsDate]}
          onChange={(d) => set('PaymentsDate', d[0])}
        />

        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </Modal>
  );
}
