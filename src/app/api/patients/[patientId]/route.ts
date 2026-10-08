/**
 * /api/patients/[patientId] (abridged sample)
 *   GET    - read one patient file
 *   PATCH  - partial update; the body says WHAT to change (see the numbered sections)
 *   DELETE - remove a patient file
 *
 * PATCH is deliberately "sparse": only the sections present in the body are
 * touched, so one endpoint serves every edit form in the dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { imageStorage, patients, verifyAdmin } from "../../_sample-ports";

type Ctx = { params: Promise<{ patientId: string }> };

const CURRENCIES = ["SYP", "USD", "EUR"];
const bad = (message: string, status = 400) => NextResponse.json({ success: false, message }, { status });

function toResponse(error: any) {
  return error?.message === "UNAUTHORIZED" ? bad("Unauthorized", 401) : bad("Internal Server Error", 500);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await verifyAdmin(req);
    const { patientId } = await params;

    // JSON for normal edits, multipart when images are attached.
    const isMultipart = (req.headers.get("content-type") || "").includes("multipart/form-data");
    let body: any = {};
    let form: FormData | null = null;
    if (isMultipart) {
      form = await req.formData();
      form.forEach((v, k) => {
        try { body[k] = JSON.parse(v.toString()); } catch { body[k] = v.toString(); }
      });
    } else {
      body = await req.json();
    }

    const patient: any = await patients.get(patientId);
    if (!patient) return bad("Record not found", 404);

    // 1) Personal details: copy only the allowed fields that were sent.
    for (const field of ["name", "phone", "age", "work"]) {
      if (body[field] !== undefined) patient[field] = body[field];
    }

    // 2) New treatment (starts without sessions; currency validated).
    if (body.newTreatmentData) {
      const currency = CURRENCIES.includes(body.newTreatmentData.currency) ? body.newTreatmentData.currency : "USD";
      patient.treatments.push({ ...body.newTreatmentData, currency, sessions: [] });
    }

    // 3) Sessions inside one treatment: add a new one or update an existing one.
    if (body.treatmentId && (body.newSessionData || body.updateSessionData)) {
      const treatment = patient.treatments.find((t: any) => t.treatmentId === body.treatmentId);
      if (!treatment) return bad("Treatment not found", 404);

      const patch = body.newSessionData ?? body.updateSessionData;
      if (patch.paymentCurrency && !CURRENCIES.includes(patch.paymentCurrency)) {
        return bad("Unsupported currency"); // allow-list instead of a silent default
      }
      if (body.newSessionData) {
        treatment.sessions.push({ ...patch, sessionDate: new Date(patch.sessionDate || Date.now()) });
      } else {
        const session = treatment.sessions.find((s: any) => s.sessionId === patch.sessionId);
        if (session) Object.assign(session, patch); // keeps the payment currency that was sent
      }
    }

    // 3b) Deletions are explicit ids in the body, never inferred.
    if (body.deleteTreatmentId) {
      patient.treatments = patient.treatments.filter((t: any) => t.treatmentId !== body.deleteTreatmentId);
    }
    if (body.deleteSession) {
      const t = patient.treatments.find((x: any) => x.treatmentId === body.deleteSession.treatmentId);
      if (t) t.sessions = t.sessions.filter((s: any) => s.sessionId !== body.deleteSession.sessionId);
    }

    // 4) Images: upload new files, then remove the ones the doctor deleted.
    for (const file of (form?.getAll("newImages") ?? []) as File[]) {
      patient.images.push({ src: await imageStorage.upload(file), date: new Date() });
    }
    if (Array.isArray(body.deleteImageIds)) {
      const doomed = patient.images.filter((i: any) => body.deleteImageIds.includes(String(i.id)));
      await Promise.all(doomed.map((i: any) => imageStorage.remove(i.src).catch(() => null)));
      patient.images = patient.images.filter((i: any) => !body.deleteImageIds.includes(String(i.id)));
    }

    if (body.nextSessionDate) patient.nextSessionDate = new Date(body.nextSessionDate);

    const saved = await patients.save(patient);
    revalidateTag("patient");
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return toResponse(error);
  }
}

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await verifyAdmin(req);
    const { patientId } = await params;
    const patient = await patients.get(patientId);
    return patient ? NextResponse.json({ success: true, data: patient }) : bad("Not found", 404);
  } catch (error) {
    return toResponse(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    await verifyAdmin(req);
    const { patientId } = await params;
    return (await patients.remove(patientId))
      ? NextResponse.json({ success: true, message: "Deleted successfully" })
      : bad("Not found", 404);
  } catch (error) {
    return toResponse(error);
  }
}
