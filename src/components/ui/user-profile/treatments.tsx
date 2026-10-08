"use client";
/**
 * Treatments (doctor view, abridged sample)
 * Lists every treatment of a patient with its sessions, and hosts the four
 * modals (add/edit treatment, add/edit session). Each action sends a small
 * PATCH request and refreshes the server data.
 */
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Plus, Trash2 } from "lucide-react";
import teethData from "../../../../public/multiOptions/teeth.json";
import EditTreatmentModal from "../modal/EditTreatmentModal";
import AddSessionModal from "../modal/AddSessionModal";
import UpdateSessionModal from "../modal/UpdateSessionModal";
import AddTreatmentModal from "../modal/AddNewtreatment";
import { summarizeTeeth } from "@/utils/summarizeTeeth";

interface Session { sessionId: string; sessionDate: Date; Payments: string; paymentCurrency: string; PaymentsDate: Date }
interface Tooth { id: string; value: string; customTreatment?: string }
interface Treatment {
  treatmentId: string;
  treatmentNames: { name: string }[];
  cost: number;
  currency: string;
  teeth: Tooth[];
  sessions: Session[];
}

export default function Treatments({ patient }: { patient: { patientId: string; treatments: Treatment[] } }) {
  const router = useRouter();

  // One piece of state per modal; the selected treatment/session is stored with it.
  const [addTreatment, setAddTreatment] = useState(false);
  const [addSessionFor, setAddSessionFor] = useState<Treatment | null>(null);
  const [editTreatment, setEditTreatment] = useState<Treatment | null>(null);
  const [editSession, setEditSession] = useState<{ treatment: Treatment; session: Session } | null>(null);

  /** Shared helper for the destructive actions: confirm -> PATCH -> refresh. */
  async function patchPatient(confirmText: string, body: Record<string, unknown>) {
    if (!confirm(confirmText)) return;
    const res = await fetch(`/api/patients/${patient.patientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) router.refresh();
  }

  return (
    <>
      <div className="p-5 border rounded-2xl">
        <div className="flex justify-between p-5">
          <h4 className="text-lg font-semibold">Treatments & Sessions</h4>
          <button onClick={() => setAddTreatment(true)} className="flex items-center gap-2 px-4 py-2 text-white bg-brand-600 rounded">
            <Plus className="w-4 h-4" /> Add New Treatment
          </button>
        </div>

        {patient.treatments.map((t) => (
          <div key={t.treatmentId} className="mb-6 p-4 border rounded-xl">
            <p className="font-semibold">{t.treatmentNames.map((n) => n.name).join(" - ")}</p>
            <p className="text-sm">Cost: {t.cost} {t.currency}</p>

            {/* Treated teeth: whole groups collapse into one label, custom notes stay visible */}
            <p className="text-sm">
              Teeth:{" "}
              {summarizeTeeth(t.teeth).map((l, i, all) => (
                <React.Fragment key={l.key}>
                  <span className={l.group ? "font-bold text-brand-700" : ""}>{l.text}</span>
                  {l.custom && <span className="font-bold"> ({l.custom})</span>}
                  {i < all.length - 1 && " , "}
                </React.Fragment>
              ))}
            </p>

            <div className="flex gap-2 mt-3">
              <button onClick={() => setEditTreatment(t)} className="flex items-center gap-2 px-3 py-1 text-white bg-brand-600 rounded">
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => patchPatient("Delete this treatment?", { deleteTreatmentId: t.treatmentId })}
                className="flex items-center gap-2 px-3 py-1 text-white bg-red-600 rounded"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>

            {t.sessions.map((s, i) => (
              <div key={s.sessionId} className="pl-4 border-l my-6">
                <p className="font-semibold">Session {i + 1}</p>
                <p className="text-sm">
                  {new Date(s.sessionDate).toLocaleDateString("en-US")} - Payment: {s.Payments} {s.paymentCurrency}
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setEditSession({ treatment: t, session: s })} className="px-3 py-1 text-white bg-brand-600 rounded">
                    Edit
                  </button>
                  <button
                    onClick={() => patchPatient("Delete this session?", { deleteSession: { treatmentId: t.treatmentId, sessionId: s.sessionId } })}
                    className="px-3 py-1 text-white bg-red-600 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <button onClick={() => setAddSessionFor(t)} className="flex items-center gap-2 px-3 py-1 mt-4 text-white bg-brand-600 rounded">
              <Plus className="w-4 h-4" /> Add Session
            </button>
          </div>
        ))}
      </div>

      {/* Modals are mounted only while they are needed, so their forms always start fresh */}
      {addTreatment && (
        <AddTreatmentModal isOpen onClose={() => setAddTreatment(false)} patientId={patient.patientId} />
      )}
      {addSessionFor && (
        <AddSessionModal isOpen onClose={() => setAddSessionFor(null)} patientId={patient.patientId} treatmentId={addSessionFor.treatmentId} />
      )}
      {editSession && (
        <UpdateSessionModal
          isOpen
          onClose={() => setEditSession(null)}
          patientId={patient.patientId}
          treatmentId={editSession.treatment.treatmentId}
          session={editSession.session}
        />
      )}
      {editTreatment && (
        <EditTreatmentModal
          isOpen
          onClose={() => setEditTreatment(null)}
          patientId={patient.patientId}
          treatment={editTreatment}
          onSave={() => setEditTreatment(null)}
          teethData={teethData}
        />
      )}
    </>
  );
}
