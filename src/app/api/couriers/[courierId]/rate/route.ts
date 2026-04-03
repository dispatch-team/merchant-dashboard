import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://service.staging.dispattch.dev/api/v1/couriers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courierId: string }> }
) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  const { courierId } = await params;
  if (!courierId) {
    return NextResponse.json({ error: "missing_courier_id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const url = `${API_BASE}/${encodeURIComponent(courierId)}/rate`;
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
    console.error("Courier rate POST failed:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach courier service" },
      { status: 500 }
    );
  }
}
