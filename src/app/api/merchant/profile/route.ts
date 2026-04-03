import { NextRequest, NextResponse } from "next/server";
import { normalizeMerchantProfile } from "@/lib/merchantProfile";

const PROFILE_URL = "https://service.staging.dispattch.dev/api/v1/merchants/profile";
/** Profile reads use /profile; updates are on the merchants collection (PATCH /profile returns 404 upstream). */
const UPDATE_URL = "https://service.staging.dispattch.dev/api/v1/merchants/";


export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "missing_authorization" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(PROFILE_URL, {
      headers: {
        Authorization: authHeader,
      },
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const normalized = normalizeMerchantProfile(data);
    return NextResponse.json(normalized ?? data, { status: res.status });
  } catch (err) {
    console.error("Failed to load merchant profile:", err);

    return NextResponse.json(
      {
        error: "network_error",
        error_description: "Unable to reach backend",
      },
      { status: 500 }
    );
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "missing_authorization" },
        { status: 401 }
      );
    }

    const incomingFormData = await request.formData();
    const outgoingFormData = new FormData();

    // Iterate over all fields in the incoming FormData and append to the outgoing one
    for (const [key, value] of incomingFormData.entries()) {
      outgoingFormData.append(key, value);
    }

    const res = await fetch(UPDATE_URL, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
      },
      body: outgoingFormData,
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
