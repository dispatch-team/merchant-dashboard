import { NextRequest, NextResponse } from "next/server";
import { TOKEN_URL, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } from "@/lib/keycloak.server";

export async function POST(request: NextRequest) {
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Refresh token is required." },
      { status: 400 }
    );
  }

  if (TOKEN_URL.includes("undefined")) {
    console.warn("auth/refresh: KEYCLOAK_URL is missing from environment. Cannot refresh token.");
    return NextResponse.json(
      { error: "server_error", error_description: "Missing Keycloak env variables" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      refresh_token,
    }),
  });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Token refresh failed:", err);
    return NextResponse.json(
      { error: "network_error", error_description: err.message },
      { status: 500 }
    );
  }
}
