import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");
  const granularity = searchParams.get("granularity");

  if (!start_date || !end_date || !granularity) {
    return NextResponse.json(
      { error: "bad_request", message: "start_date, end_date, and granularity are required" },
      { status: 400 }
    );
  }

  const url = `https://service.staging.dispattch.dev/api/v1/analytics/merchants/${id}/shipments/summary?start_date=${encodeURIComponent(
    start_date
  )}&end_date=${encodeURIComponent(end_date)}&granularity=${encodeURIComponent(granularity)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: authHeader },
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Failed to fetch merchant shipment summary:", err);
    return NextResponse.json(
      { error: "network_error", message: "Unable to fetch merchant shipment summary from service" },
      { status: 500 }
    );
  }
}
