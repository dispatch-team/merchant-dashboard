import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://service.staging.dispattch.dev/api/v1/addresses/autocomplete";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const body = await request.text();

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Failed to autocomplete address:", err);
    return NextResponse.json(
      { error: "network_error", message: "Unable to reach address service" },
      { status: 500 }
    );
  }
}
