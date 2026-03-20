import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Username and password are required." },
      { status: 400 }
    );
  }

  const loginUrl = "http://localhost:8080/api/v1/merchants/login";

  try {
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch((e) => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach backend" },
      { status: 500 }
    );
  }
}
