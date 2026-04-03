import { NextRequest, NextResponse } from "next/server";

const LOGO_BASE_URL = "https://service.staging.dispattch.dev/api/v1/couriers/logos/";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const awaitedParams = await params;

  let token = "";
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    token =
      request.cookies.get("dispatch_access_token")?.value ||
      request.nextUrl.searchParams.get("token") ||
      "";
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
    console.error("Failed to fetch courier logo:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach courier service" },
      { status: 500 }
    );
  }
}
