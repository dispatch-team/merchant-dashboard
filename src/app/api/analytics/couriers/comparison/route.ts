import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");
  const sort_by = searchParams.get("sort_by") || "total_shipments";
  const order = searchParams.get("order") || "desc";

  if (!start_date || !end_date) {
    return NextResponse.json(
      { error: "bad_request", message: "start_date and end_date are required" },
      { status: 400 }
    );
  }

  const url = `https://service.staging.dispattch.dev/api/v1/analytics/couriers/comparison?start_date=${encodeURIComponent(
    start_date
  )}&end_date=${encodeURIComponent(end_date)}&sort_by=${encodeURIComponent(
    sort_by
  )}&order=${encodeURIComponent(order)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: authHeader },
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Failed to fetch courier comparison analytics:", err);
    return NextResponse.json(
      { error: "network_error", message: "Unable to fetch courier comparison from service" },
      { status: 500 }
    );
  }
}
