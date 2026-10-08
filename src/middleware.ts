/**
 * Route guard for the doctor dashboard (abridged sample).
 *   1. maintenance switch: while on, every dashboard page (except sign-in) shows the maintenance page,
 *   2. auth guard: dashboard pages need a session cookie, otherwise go to sign-in.
 * This is only a fast, first line of defence - every API route still verifies the session itself.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/utils/sessionCookie";

const SIGN_IN = "/dashboard/signin";
const MAINTENANCE = "/dashboard/maintenance";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url));

  const maintenanceOn = process.env.NEXT_PUBLIC_DASHBOARD_MAINTENANCE === "true";
  const isPublicDashboardPage = pathname === SIGN_IN || pathname === MAINTENANCE;

  if (maintenanceOn && !isPublicDashboardPage) return go(MAINTENANCE);
  if (!maintenanceOn && pathname === MAINTENANCE) return go("/dashboard"); // switch is off: leave the maintenance page

  if (!isPublicDashboardPage && !req.cookies.get(SESSION_COOKIE)?.value) return go(SIGN_IN);

  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
