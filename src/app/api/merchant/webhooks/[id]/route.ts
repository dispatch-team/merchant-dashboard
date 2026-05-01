import { NextRequest, NextResponse } from "next/server";

const WEBHOOKS_BASE_URL = "https://service.staging.dispattch.dev/api/v1/webhooks";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  const { id } = await params;
  const targetUrl = `${WEBHOOKS_BASE_URL}/${id}`;

  try {
    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers: { Authorization: authHeader },
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`Failed to delete webhook ${id}:`, err);
    return NextResponse.json(
      { error: "network_error", error_description: "Internal server error" },
      { status: 500 }
    );
  }
}
