"use client";
/**
 * UserMetaCard (doctor view, abridged sample)
 * Header card of a patient file (name, work, age, phone, access code) with an edit modal.
 */
import { useState } from "react";
import { Edit2Icon } from "lucide-react";
import Input from "../../form/input/InputField";
import Label from "../../form/Label";
import Button from "../button/Button";
import Modal from "../modal";
import { usePatientPatch, type FieldErrors } from "@/hooks/usePatientPatch";

interface PatientType { patientId: string; name: string; age: number; phone: string; work: string; code: string }

export default function UserMetaCard({ patient }: { patient: PatientType }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: patient.name, age: patient.age, phone: patient.phone, work: patient.work });
  const { errors, saving, save } = usePatientPatch(patient.patientId, () => setOpen(false));

  const set = (field: keyof typeof form, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  // Sparse body: the endpoint copies only these personal fields.
  const submit = () => save(() => (form.name.trim() ? {} : { name: "Name is required" }) as FieldErrors, form);

  return (
    <>
      <div className="p-5 border rounded-2xl lg:p-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h4 className="text-lg font-semibold">{patient.name}</h4>
          <p className="text-sm text-gray-500">{patient.work} · {patient.age}</p>
        </div>
        <p>Phone: {patient.phone}</p>
        <p>Code: {patient.code}</p>
        <Button className="text-xs" onClick={() => setOpen(true)}>
          <Edit2Icon className="w-4 h-4" /> Edit
        </Button>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} isFullscreen>
        <div className="p-6">
          <h4 className="text-xl font-semibold mb-4">Edit patient details</h4>
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          <Label>Work</Label>
          <Input value={form.work} onChange={(e) => set("work", e.target.value)} />
          <Label>Age</Label>
          <Input type="number" value={form.age} onChange={(e) => set("age", parseInt(e.target.value))} />
          <Label>Phone</Label>
          <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
