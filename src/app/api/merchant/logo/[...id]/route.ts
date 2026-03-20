import { NextRequest, NextResponse } from "next/server";

const LOGO_BASE_URL = "http://localhost:8000/api/v1/merchants/logos/";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  // Await params in Next.js 15
  const awaitedParams = await params;

  // Try to get token from Authorization header or cookie
  let token = "";
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split("Bearer ")[1];
  } else {
    const cookie = request.headers.get("cookie") || "";
    token = cookie
      .split("; ")
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1] || "";
  }

  if (!token) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const idPath = awaitedParams.id.join("/");
    const res = await fetch(`${LOGO_BASE_URL}${idPath}`, {
      headers: { Authorization: `Bearer ${token}` },
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
        "Cache-Control": "public, max-age=3600",
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
