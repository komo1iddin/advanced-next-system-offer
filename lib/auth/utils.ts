import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "./options";

/**
 * Checks if the user is authenticated and has admin role on server components
 * Redirects to login page if not authenticated or to home if not authorized
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}

/**
 * Middleware function to check if user is admin in API routes
 */
export async function isAdminRequest(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return true;
} 