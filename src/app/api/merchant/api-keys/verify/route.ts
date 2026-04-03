import { NextRequest, NextResponse } from "next/server";

const VERIFY_URL = "https://service.staging.dispattch.dev/api/v1/api-keys/verify";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { 
        Authorization: authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Failed to verify API key:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Internal server error" },
      { status: 500 }
    );
  }
}
