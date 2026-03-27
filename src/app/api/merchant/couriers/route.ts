import { NextRequest, NextResponse } from "next/server";

const MERCHANT_COURIERS_URL = "https://service.staging.dispattch.dev/api/v1/merchant-couriers/";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const res = await fetch(MERCHANT_COURIERS_URL, {
      headers: { Authorization: authHeader },
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ([]));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Failed to load partner couriers:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach merchant service" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const res = await fetch(MERCHANT_COURIERS_URL, {
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
    console.error("Failed to add partner courier:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Internal server error" },
      { status: 500 }
    );
  }
}
