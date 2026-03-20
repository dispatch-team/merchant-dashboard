import { NextRequest, NextResponse } from "next/server";

const PROFILE_URL = "http://localhost:8000/api/v1/merchants/profile";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  try {
    const res = await fetch(PROFILE_URL, {
      headers: { Authorization: authHeader },
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Failed to load merchant profile:", err);
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach backend" },
      { status: 500 }
    );
  }
}

const UPDATE_URL = "http://localhost:8000/api/v1/merchants/";

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    // Note: Forwarding Content-Type is essential for multipart boundary
    const contentType = request.headers.get("content-type") || "";

    const res = await fetch(UPDATE_URL, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
        "Content-Type": contentType,
      },
      body: request.body,
      // @ts-ignore - Required for streaming in Node/Next
      duplex: "half",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("PATCH profile error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
