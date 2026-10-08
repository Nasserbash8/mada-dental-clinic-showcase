/**
 * POST /api/admin/signIn (abridged sample)
 *
 * Doctor login flow:
 *   validate input -> verify credentials -> issue a signed, expiring session
 *   -> deliver it in an HttpOnly cookie (never in the response body).
 * Token signing, cookie settings and credential storage live behind `adminAuth`.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../_sample-ports";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const admin = await adminAuth.verifyCredentials(email, password);
    if (!admin) {
      // Same message for "unknown user" and "wrong password" so the response does not reveal which one failed.
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Logged in successfully" },
      { status: 200, headers: { "Set-Cookie": adminAuth.issueSessionCookie(admin.id) } }
    );
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
