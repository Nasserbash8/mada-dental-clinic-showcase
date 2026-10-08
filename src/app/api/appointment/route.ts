/**
 * /api/appointment (abridged sample)
 *   GET  - list appointments (doctor only)
 *   POST - create an appointment (doctor only)
 *
 * Pattern: auth guard first, then validation, then the repository call,
 * then cache revalidation so server-rendered pages pick up the change.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { appointments, verifyAdmin } from "../_sample-ports";

/** One place to translate errors into HTTP responses. */
function fail(error: any, fallback: string) {
  const unauthorized = error?.message === "UNAUTHORIZED";
  return NextResponse.json(
    { success: false, message: unauthorized ? "Access Denied" : fallback },
    { status: unauthorized ? 401 : 500 }
  );
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    const { items } = await appointments.list({ skip: 0, limit: 500 });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return fail(error, "Internal Server Error");
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
    const body = await req.json();

    // Minimal validation: the two fields every appointment needs.
    if (!body.phone || !body.appointmentDate) {
      return NextResponse.json(
        { success: false, message: "Phone number and date are required" },
        { status: 400 }
      );
    }

    const created = await appointments.create({
      ...body,
      appointmentDate: new Date(body.appointmentDate),
      status: body.status || "pending", // new appointments wait for confirmation
    });

    revalidateTag("appointment"); // refresh cached views that list appointments
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return fail(error, "Failed to create appointment");
  }
}
