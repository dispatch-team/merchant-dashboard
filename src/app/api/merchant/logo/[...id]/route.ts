import { NextRequest, NextResponse } from "next/server";

const LOGO_BASE_URL = "https://service.staging.dispattch.dev/api/v1/merchants/logos/";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const awaitedParams = await params;


  let token = "";
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split("Bearer ")[1];
  } else {
    token =
      request.cookies.get("dispatch_access_token")?.value ||
      request.nextUrl.searchParams.get("token") ||
      "";
  }

  if (!token) {
    return NextResponse.json(
      { error: "missing_authorization" },
      { status: 401 }
    );
  }

  try {
    const idPath = awaitedParams.id.join("/");
    const url = `${LOGO_BASE_URL}${idPath}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: "failed_to_fetch_logo" },
        { status: res.status }
      );
    }


    const contentType =
      res.headers.get("content-type") || "image/png";

    return new NextResponse(res.body, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });

  } catch (err) {
    console.error("Failed to fetch merchant logo:", err);

    return NextResponse.json(
      {
        error: "network_error",
        error_description: "Unable to reach backend",
      },
      { status: 500 }
    );
  }
}