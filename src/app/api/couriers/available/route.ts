import { NextRequest, NextResponse } from "next/server";

const AVAILABLE_COURIERS_URL = "https://service.staging.dispattch.dev/api/v1/couriers/available";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const res = await fetch(AVAILABLE_COURIERS_URL, {
      headers: { Authorization: authHeader },
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ([]));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Failed to load available couriers:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach courier service" },
      { status: 500 }
    );
  }
}
