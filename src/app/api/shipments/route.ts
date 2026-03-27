import { NextRequest, NextResponse } from "next/server";

const SHIPMENTS_URL =
  "https://service.staging.dispattch.dev/api/v1/shipments";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const body = await request.text();

    const res = await fetch(SHIPMENTS_URL, {
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
    console.error("Failed to create shipment:", err);
    return NextResponse.json(
      { error: "network_error", message: "Unable to reach shipment service" },
      { status: 500 }
    );
  }
}
