/**
 * POST /api/admin/logout (abridged sample)
 * Logging out = sending back an expired session cookie, so the browser drops it.
 */
import { NextResponse } from "next/server";
import { adminAuth } from "../../_sample-ports";

export async function POST() {
  try {
    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200, headers: { "Set-Cookie": adminAuth.clearSessionCookie() } }
    );
  } catch {
    return NextResponse.json({ success: false, message: "Error during logout" }, { status: 500 });
  }
}
