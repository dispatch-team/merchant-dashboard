import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Username and password are required." },
      { status: 400 }
    );
  }

  const loginUrl = "https://service.staging.dispattch.dev/api/v1/merchants/login";

  try {
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error("[merchant login] backend error:", res.status);
    }

    let data: unknown;
    try { data = JSON.parse(raw); } catch { data = {}; }

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[merchant login] fetch error:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach backend" },
      { status: 500 }
    );
  }
}
