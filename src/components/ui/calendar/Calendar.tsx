'use client'
/**
 * Calendar (abridged sample)
 * One day view that merges two sources into FullCalendar events:
 *   - patients with a next-session date (green, click opens the patient file),
 *   - appointment requests (status-coloured; "pending" = new patient).
 * The doctor can add an appointment from a small modal.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import arLocale from "@fullcalendar/core/locales/ar";

const Modal = dynamic(() => import("../modal"));
const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
const DatePicker = dynamic(() => import("../../form/date-picker"));

type PatientLike = { patientId: string; name: string; nextSessionDate?: Date; code: string };
type AppointmentLike = { _id?: string; name: string; phone: string; appointmentDate: Date; notes: string; status: string };

const PATIENT_SESSION_MIN = 45;
const APPOINTMENT_MIN = 30;
const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * 60000);

const colorFor = (type: string, status: string) =>
  type === "patient" ? "border-r-4 border-green-600"
  : status === "pending" ? "border-r-4 border-brand-900"
  : status === "canceled" ? "border-r-4 border-red-500"
  : "border-r-4 border-blue-400";

export default function Calendar({ Appointment, patients }: { Appointment: AppointmentLike[]; patients: PatientLike[] }) {
  const router = useRouter();
  const [extra, setExtra] = useState<any[]>([]); // events added in this session, before the next server refresh
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", notes: "", date: [] as Date[], time: "" });

  // Events are derived from props - no effect + state copy needed.
  const events = useMemo(() => {
    const fromPatients = patients
      .filter((p) => p.nextSessionDate)
      .map((p) => {
        const start = new Date(p.nextSessionDate!);
        if (start.getHours() === 0 && start.getMinutes() === 0) start.setHours(9, 0, 0); // date-only values default to 9:00
        return { id: `pt-${p.patientId}`, title: p.name, start, end: addMinutes(start, PATIENT_SESSION_MIN),
                 extendedProps: { type: "patient", patientId: p.patientId } };
      });

    const fromAppointments = Appointment.map((a, i) => {
      const start = new Date(a.appointmentDate);
      return { id: `appt-${a._id ?? i}`, title: a.name, start, end: addMinutes(start, APPOINTMENT_MIN),
               extendedProps: { type: "appointment", status: a.status, phone: a.phone, notes: a.notes } };
    });
    return [...fromAppointments, ...fromPatients, ...extra];
  }, [Appointment, patients, extra]);

  async function addAppointment() {
    if (!form.name || !form.date.length || !form.time) return;

    // Combine the picked day with the time input.
    const when = new Date(form.date[0]);
    const [h, m] = form.time.split(":").map(Number);
    when.setHours(h, m, 0, 0);

    const res = await fetch("/api/appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone, notes: form.notes, appointmentDate: when.toISOString(), status: "pending" }),
    });

    if (res.ok) {
      const { data } = await res.json(); // the API wraps the saved record in { data }
      const start = new Date(data.appointmentDate);
      setExtra((prev) => [...prev, { title: data.name, start, end: addMinutes(start, APPOINTMENT_MIN), extendedProps: { type: "appointment", status: data.status } }]);
      setOpen(false);
      setForm({ name: "", phone: "", notes: "", date: [], time: "" });
    }
  }

  return (
    <div className="rounded-2xl border">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        locale={arLocale}
        direction="rtl"
        headerToolbar={{ left: "prev,next addEventButton", center: "title", right: "" }}
        customButtons={{ addEventButton: { text: "+", click: () => setOpen(true) } }}
        events={events}
        slotMinTime="07:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        eventContent={(info) => {
          const { type, status, patientId } = info.event.extendedProps;
          return (
            <div
              onClick={() => type === "patient" && router.push(`/dashboard/profile/${patientId}`)}
              className={`cursor-pointer p-1 text-sm bg-[#f9fafb] ${colorFor(type, status)}`}
            >
              <div>{info.timeText}</div>
              <div>{info.event.title}</div>
            </div>
          );
        }}
      />

      <Modal isOpen={open} isFullscreen onClose={() => setOpen(false)}>
        <div className="bg-white p-10 rounded">
          <input className="border p-2 mb-2 w-full" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border p-2 mb-2 w-full" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <DatePicker id="appointment-date" label="Date" value={form.date} onChange={(d) => setForm({ ...form, date: d })} />
          <input type="time" className="w-full border rounded-lg px-3 py-2 my-2" min="07:00" max="23:00" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <textarea className="border p-2 mb-4 w-full" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-4">
            <button onClick={addAppointment} className="bg-brand-900 text-white px-4 py-2 rounded">Add</button>
            <button onClick={() => setOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
