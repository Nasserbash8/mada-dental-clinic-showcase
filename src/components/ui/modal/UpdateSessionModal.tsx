'use client';
/**
 * UpdateSessionModal (abridged sample)
 * Edits an existing session. The form is re-seeded from the selected session
 * every time the modal opens, and the payment currency is part of the form so
 * editing a payment never silently resets its currency.
 */
import React, { useEffect, useState } from 'react';
import Modal from '.';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import DatePicker from '@/components/form/date-picker';
import Button from '../button/Button';
import { CURRENCY_OPTIONS, usePatientPatch, type FieldErrors } from '@/hooks/usePatientPatch';

interface Session {
  sessionId: string;
  sessionDate: Date;
  Payments: string;
  paymentCurrency: string;
  PaymentsDate: Date;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  treatmentId: string;
  session: Session | null;
};

export default function UpdateSessionModal({ isOpen, onClose, patientId, treatmentId, session }: Props) {
  const [form, setForm] = useState<Session | null>(null);
  const { errors, saving, save } = usePatientPatch(patientId, onClose);

  // Seed the form from the selected session whenever the modal is (re)opened.
  useEffect(() => {
    if (session && isOpen) {
      setForm({
        ...session,
        sessionDate: new Date(session.sessionDate),
        PaymentsDate: new Date(session.PaymentsDate),
      });
    }
  }, [session, isOpen]);

  if (!form) return null;
  const set = (field: keyof Session, value: any) => setForm((p) => (p ? { ...p, [field]: value } : p));

  const submit = () =>
    save(
      () => (form.Payments ? {} : { Payments: 'Payment is required' }) as FieldErrors,
      { treatmentId, updateSessionData: form } // the server merges only these fields
    );

  return (
    <Modal isFullscreen isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h4 className="text-xl font-semibold mb-4">Edit Session Data</h4>

        <DatePicker
          id="update-session-date"
          label="Session Date"
          value={[form.sessionDate]}
          onChange={(d) => set('sessionDate', d[0])}
        />

        <Label>Payment and Currency</Label>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-grow">
            <Input value={form.Payments} onChange={(e) => set('Payments', e.target.value)} />
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
          id="update-payments-date"
          label="Payment Date"
          value={[form.PaymentsDate]}
          onChange={(d) => set('PaymentsDate', d[0])}
        />

        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>
    </Modal>
  );
}
