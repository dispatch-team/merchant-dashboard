export interface ShipmentPayload {
  courier_company_id: number;
  merchant_user_id: string;
  start_address: string;
  end_address: string;
  description: string;
  weight_kg?: number;
  dimensions?: string;
  webhook_url?: string;
  items?: string[];
}

export interface ShipmentResponse {
  id: string;
  status: string;
  courier_company_id: number;
  merchant_user_id: string;
  start_address: string;
  end_address: string;
  description: string;
  weight_kg?: number;
  dimensions?: string;
  webhook_url?: string;
  items?: string[];
  created_at?: string;
  [key: string]: unknown;
}

export async function createShipment(
  token: string,
  payload: ShipmentPayload
): Promise<ShipmentResponse> {
  const res = await fetch("/api/shipments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || "Failed to create shipment"
    );
  }

  return data as ShipmentResponse;
}
