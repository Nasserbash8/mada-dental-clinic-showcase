"use client";
/**
 * usePatientPatch - shared save logic for the patient edit modals (abridged sample).
 *
 * Every modal sends a small, sparse PATCH body to the same endpoint. This hook
 * owns the repeated parts: the "saving" flag (prevents double submits),
 * validation errors, the request itself and the refresh after success.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

export type FieldErrors = Record<string, string>;

export const CURRENCY_OPTIONS = [
  { value: "SYP", label: "SYP (Syrian Pound)" },
  { value: "USD", label: "USD (Dollar)" },
  { value: "EUR", label: "EUR (Euro)" },
];

export function usePatientPatch(patientId: string, onDone: () => void) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  /**
   * @param validate returns a map of field -> message; an empty map means "valid"
   * @param body     the sparse PATCH body for this modal
   */
  async function save(validate: () => FieldErrors, body: Record<string, unknown>) {
    if (saving) return; // ignore double clicks while a request is in flight

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onDone();
        router.refresh(); // re-fetch server components so the profile shows the change
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  }

  return { errors, saving, save };
}
