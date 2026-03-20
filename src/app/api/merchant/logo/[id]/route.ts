import { NextRequest, NextResponse } from "next/server";

const LOGO_BASE_URL = "http://localhost:8000/api/v1//merchants/logos/";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const { id } = params;
    const res = await fetch(`${LOGO_BASE_URL}${id}`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "failed_to_fetch_logo" }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    console.error("Failed to fetch merchant logo:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach backend" },
      { status: 500 }
    );
  }
}
