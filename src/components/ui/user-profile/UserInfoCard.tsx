"use client";
/**
 * UserInfoCard (doctor view, abridged sample)
 * Medical notes of a patient (illnesses, medicines, other info) and the next appointment.
 * Two small modals edit them; both save through the shared `usePatientPatch` hook.
 */
import { useState } from "react";
import { Edit2Icon, Plus } from "lucide-react";
import DatePicker from "../../form/date-picker";
import Button from "../button/Button";
import Label from "../../form/Label";
import Modal from "../modal";
import { usePatientPatch, type FieldErrors } from "@/hooks/usePatientPatch";

interface PatientType {
  patientId: string;
  illnesses: { illness: string }[];
  Medicines: { medicine: string }[];
  info: string;
  nextSessionDate?: string;
}

/** Editable list of free-text values ("add another" button + one input per entry). */
function ListEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      {values.map((v, i) => (
        <input
          key={i}
          className="w-full mb-2 border rounded-lg px-3 py-2"
          value={v}
          onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
        />
      ))}
      <Button onClick={() => onChange([...values, ""])} className="mt-2">Add</Button>
    </div>
  );
}

export default function UserInfoCard({ patient }: { patient: PatientType }) {
  const [dateOpen, setDateOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("07:00");
  const [illnesses, setIllnesses] = useState(patient.illnesses.map((i) => i.illness));
  const [medicines, setMedicines] = useState(patient.Medicines.map((m) => m.medicine));

  const dateSave = usePatientPatch(patient.patientId, () => setDateOpen(false));
  const notesSave = usePatientPatch(patient.patientId, () => setNotesOpen(false));
  const valid = () => ({}) as FieldErrors;

  /** Combine the picked day and the time input into one ISO timestamp. */
  const saveAppointment = () => {
    const [h, m] = time.split(":").map(Number);
    const when = new Date(date);
    when.setHours(h, m, 0, 0);
    return dateSave.save(valid, { nextSessionDate: when.toISOString() });
  };

  // Empty rows are dropped before sending.
  const saveNotes = () =>
    notesSave.save(valid, {
      illnesses: illnesses.filter((i) => i.trim()).map((illness) => ({ illness })),
      Medicines: medicines.filter((m) => m.trim()).map((medicine) => ({ medicine })),
    });

  return (
    <div className="rounded-2xl border p-5 lg:p-6">
      <h4 className="text-lg font-semibold mb-4">Patient information</h4>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div>
          <p className="font-bold">Illnesses</p>
          {patient.illnesses.length ? patient.illnesses.map((i, k) => <p key={k}>{i.illness}</p>) : <p>None</p>}
        </div>
        <div>
          <p className="font-bold">Medicines</p>
          {patient.Medicines.length ? patient.Medicines.map((m, k) => <p key={k}>{m.medicine}</p>) : <p>None</p>}
        </div>
        <div>
          <p className="font-bold">Other info</p>
          <p>{patient.info || "None"}</p>
          <Button className="text-xs mt-3" onClick={() => setNotesOpen(true)}><Edit2Icon className="w-4 h-4" /> Edit</Button>
        </div>
        <div>
          <p className="font-bold">Next appointment</p>
          <p>{patient.nextSessionDate ? new Date(patient.nextSessionDate).toLocaleString("en-US") : "Not set"}</p>
          <button onClick={() => setDateOpen(true)} className="flex items-center gap-2 px-4 py-2 mt-3 text-white bg-brand-600 rounded">
            <Plus className="w-4 h-4" /> New appointment
          </button>
        </div>
      </div>

      <Modal isOpen={dateOpen} onClose={() => setDateOpen(false)} isFullscreen>
        <div className="p-6">
          <h4 className="text-xl font-semibold mb-4">New appointment</h4>
          <DatePicker
            id="next-session-date"
            label="Date"
            value={date ? [new Date(date)] : []}
            onChange={(d: Date[]) => setDate(d.length ? d[0].toLocaleDateString("en-CA") : "")} // local YYYY-MM-DD, no timezone shift
          />
          <Label>Time</Label>
          <input type="time" className="w-full border rounded-lg px-3 py-2" value={time} min="07:00" max="23:00" onChange={(e) => setTime(e.target.value)} />
          <div className="flex justify-end mt-6 gap-2">
            <Button variant="outline" onClick={() => setDateOpen(false)}>Cancel</Button>
            <Button disabled={!date || dateSave.saving} onClick={saveAppointment}>{dateSave.saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={notesOpen} onClose={() => setNotesOpen(false)} isFullscreen>
        <div className="p-6">
          <h4 className="text-xl font-semibold mb-4">Edit illnesses and medicines</h4>
          <ListEditor label="Illnesses" values={illnesses} onChange={setIllnesses} />
          <ListEditor label="Medicines" values={medicines} onChange={setMedicines} />
          <div className="flex justify-end mt-6 gap-2">
            <Button variant="outline" onClick={() => setNotesOpen(false)}>Cancel</Button>
            <Button disabled={notesSave.saving} onClick={saveNotes}>{notesSave.saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
