/**
 * POST /api/admin/signUp (abridged sample)
 * Creates a doctor account (initial setup / account management).
 * Passwords are hashed inside `adminAuth.createAdmin`; the route never stores plain text.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../_sample-ports";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    await adminAuth.createAdmin(email, password);
    return NextResponse.json({ success: true, message: "Admin created successfully." });
  } catch {
    // Generic message: internal errors are not exposed to the client.
    return NextResponse.json({ success: false, message: "Could not create account" }, { status: 500 });
  }
}
