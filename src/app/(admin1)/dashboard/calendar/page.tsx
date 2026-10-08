/** Dashboard - calendar (server component, abridged sample). */
import nextDynamic from "next/dynamic";
import { listCalendarData } from "@/utils/patientData";

const CalendarWrapper = nextDynamic(() => import("@/components/ui/calendar/calenderWrapper"));

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  // Appointments (walk-in requests) and patients with a next-session date are shown on one calendar.
  const { appointments, patients } = await listCalendarData().catch(() => ({ appointments: [], patients: [] }));

  return (
    <div>
      <CalendarWrapper Appointment={appointments} patients={patients} />
    </div>
  );
}
