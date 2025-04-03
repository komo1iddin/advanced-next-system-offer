import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "API routes are working",
    routes: {
      fixRole: "/fix-role",
      adminForce: "/admin/force",
      apis: {
        forceUpdateRole: "/api/auth/force-update-role",
        updateSession: "/api/auth/update-session"
      }
    }
  });
} 