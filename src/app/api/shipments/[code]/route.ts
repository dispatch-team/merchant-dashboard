import { NextRequest, NextResponse } from "next/server";

const SHIPMENTS_URL = "https://service.staging.dispattch.dev/api/v1/shipments";

async function proxyShipmentRequest(
  request: NextRequest,
  code: string,
  method: "GET" | "PATCH" | "DELETE"
) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "missing_authorization" }, { status: 401 });
  }

  const targetUrl = `${SHIPMENTS_URL}/${encodeURIComponent(code)}`;
  const shouldSendBody = method === "PATCH";
  const body = shouldSendBody ? await request.text() : undefined;

  try {
    const res = await fetch(targetUrl, {
      method,
      headers: {
        Authorization: authHeader,
        ...(shouldSendBody ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body } : {}),
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`Failed to proxy shipment ${method} request:`, err);
    return NextResponse.json(
      { error: "network_error", message: "Unable to reach shipment service" },
      { status: 500 }
    );
  }
}

function resolveCode(request: NextRequest, params?: { code?: string }) {
  if (params?.code) return params.code;
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const codeSegment = segments[segments.length - 1];
  return codeSegment;
}

export async function GET(request: NextRequest, { params }: { params?: { code?: string } }) {
  const code = resolveCode(request, params);
  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  return proxyShipmentRequest(request, code, "GET");
}

export async function PATCH(request: NextRequest, { params }: { params?: { code?: string } }) {
  const code = resolveCode(request, params);
  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  return proxyShipmentRequest(request, code, "PATCH");
}

export async function DELETE(request: NextRequest, { params }: { params?: { code?: string } }) {
  const code = resolveCode(request, params);
  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  return proxyShipmentRequest(request, code, "DELETE");
}
