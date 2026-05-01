import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://service.staging.dispattch.dev/api/v1/shipments";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  const { code } = await params;
  if (!code) {
    return NextResponse.json({ error: "missing_shipment_code" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const url = `${API_BASE}/${encodeURIComponent(code)}/rate`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Shipment rate POST failed:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach shipment service" },
      { status: 500 }
    );
  }
}
