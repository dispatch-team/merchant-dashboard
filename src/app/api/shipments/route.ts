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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fetchUrl = queryString ? `${SHIPMENTS_URL}?${queryString}` : SHIPMENTS_URL;

    const res = await fetch(fetchUrl, {
      headers: { Authorization: authHeader },
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Failed to fetch shipments:", err);
    return NextResponse.json(
      { error: "network_error", message: "Unable to fetch shipments" },
      { status: 500 }
    );
  }
}
