import { NextRequest, NextResponse } from "next/server";

const BACKEND_LOGOUT_URL = "https://service.staging.dispattch.dev/api/v1/merchants/logout";

export async function POST(request: NextRequest) {
  const { refresh_token } = await request.json();

  // Best-effort: attempt to invalidate the session on the backend.
  // Even if it fails, always return success so the client clears its tokens.
  try {
    if (refresh_token) {
      await fetch(BACKEND_LOGOUT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token }),
      });
    }
  } catch {
    // Silently ignore — logout is best-effort
  }

  return NextResponse.json({ success: true });
}
