import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const registerUrl = "https://service.staging.dispattch.dev/api/v1/merchants/";

  try {
    const res = await fetch(registerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Fetch to backend failed:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach backend" },
      { status: 500 }
    );
  }
}
