import { NextRequest, NextResponse } from "next/server";

const base = "https://service.staging.dispattch.dev/api/v1/merchant-couriers";

export async function DELETE(
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
    const url = `${base}/${encodeURIComponent(courierId)}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: authHeader },
    });

    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return new NextResponse(null, { status: res.status });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("DELETE merchant-courier failed:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach merchant service" },
      { status: 500 }
    );
  }
}
