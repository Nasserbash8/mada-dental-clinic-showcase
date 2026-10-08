/**
 * /api/patients (abridged sample)
 *   POST - create a patient file (doctor only; multipart form with optional images)
 *   GET  - paginated list (doctor only)
 *
 * Highlights:
 *   - multipart parsing with JSON-encoded nested fields,
 *   - image upload through an abstract storage service,
 *   - unique access-code generation with a retry loop,
 *   - input normalisation (numbers, dates, per-payment currency defaults).
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { imageStorage, patients, verifyAdmin } from "../_sample-ports";
import { generateCode } from "@/utils/patientCode";

const CURRENCIES = ["SYP", "USD", "EUR"];
const pickCurrency = (c: unknown) => (CURRENCIES.includes(String(c)) ? String(c) : "USD");

function fail(error: any) {
  const unauthorized = error?.message === "UNAUTHORIZED";
  return NextResponse.json(
    { success: false, message: unauthorized ? "Unauthorized" : "Internal Server Error" },
    { status: unauthorized ? 401 : 500 }
  );
}

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const form = await req.formData();
    const name = form.get("name")?.toString() || "";
    const phone = form.get("phone")?.toString() || "";
    const age = form.get("age")?.toString() || "";

    if (!name || !phone || !age) {
      return NextResponse.json({ success: false, message: "Required fields missing" }, { status: 400 });
    }

    // Upload images first; only the returned URLs are kept on the record.
    const images = [];
    for (const file of form.getAll("images") as File[]) {
      images.push({ src: await imageStorage.upload(file), date: new Date() });
    }

    // The patient code is what the patient later uses to sign in, so it must be unique.
    let code = generateCode();
    while (await patients.codeExists(code)) code = generateCode();

    // Nested data arrives as a JSON string inside the multipart form.
    const rawTreatments = JSON.parse(form.get("treatments")?.toString() || "[]");
    const treatments = rawTreatments.map((t: any) => ({
      ...t,
      cost: Number(t.cost) || 0,
      currency: pickCurrency(t.currency),
      // Each payment keeps its OWN currency (independent of the treatment currency).
      sessions: (t.sessions ?? []).map((s: any) => ({
        ...s,
        payments: Number(s.payments) || 0,
        paymentCurrency: pickCurrency(s.paymentCurrency),
      })),
    }));

    const saved = await patients.create({ name, phone, age, code, treatments, images });
    revalidateTag("patients");
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return fail(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100); // cap the page size
    const { items, total } = await patients.list({ skip: (page - 1) * limit, limit });

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return fail(error);
  }
}
