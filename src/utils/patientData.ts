/**
 * Server-side data loaders used by the dashboard and portal pages
 * (redacted in this public sample - only the contracts are published).
 *
 * The real implementations read from storage and return plain,
 * JSON-serialisable objects that are safe to pass to client components.
 */
export async function getPatientById(_patientId: string): Promise<any | null> {
  return null; // implementation omitted
}

/** All patients, newest first. */
export async function listPatients(): Promise<any[]> {
  return []; // implementation omitted
}

/** Appointments plus the minimal patient fields the calendar needs. */
export async function listCalendarData(): Promise<{ appointments: any[]; patients: any[] }> {
  return { appointments: [], patients: [] }; // implementation omitted
}
