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
  code?: string;
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
  updated_at?: string;
  total_fee?: number;
  merchant?: {
    company_name?: string;
  };
  courier_company?: {
    company_name?: string;
    company_address?: string;
    phone_number?: string;
    email?: string;
  };
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

export interface ShipmentListParams {
  page?: number;
  page_size?: number;
  merchant_user_id?: string;
  created_at_start?: string;
  created_at_end?: string;
}

export interface ShipmentListResponse {
  shipments: ShipmentResponse[];
  total: number;
  page: number;
  page_size: number;
}

export async function getShipments(
  token: string,
  params?: ShipmentListParams
): Promise<ShipmentListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.page_size) query.append("page_size", params.page_size.toString());
  if (params?.merchant_user_id) query.append("merchant_user_id", params.merchant_user_id);
  if (params?.created_at_start) query.append("created_at_start", params.created_at_start);
  if (params?.created_at_end) query.append("created_at_end", params.created_at_end);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const res = await fetch(`/api/shipments${queryString}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to fetch shipments");
  }

  return data as ShipmentListResponse;
}

export interface ShipmentUpdatePayload {
  courier_company_id?: number;
  start_address?: string;
  end_address?: string;
  description?: string;
  weight_kg?: number;
  dimensions?: string;
  webhook_url?: string;
  items?: string[];
  status?: string;
}

export async function getShipmentDetails(token: string, code: string): Promise<ShipmentResponse> {
  const encodedCode = encodeURIComponent(code);
  const res = await fetch(`/api/shipments/${encodedCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data?.message || data?.error || "Failed to fetch shipment details");
    (error as any).status = res.status;
    throw error;
  }

  return data as ShipmentResponse;
}

export async function updateShipment(
  token: string,
  code: string,
  payload: ShipmentUpdatePayload
): Promise<ShipmentResponse> {
  const encodedCode = encodeURIComponent(code);
  const res = await fetch(`/api/shipments/${encodedCode}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to update shipment");
  }

  return data as ShipmentResponse;
}

export async function deleteShipment(token: string, code: string): Promise<void> {
  const encodedCode = encodeURIComponent(code);
  const res = await fetch(`/api/shipments/${encodedCode}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || data?.error || "Failed to delete shipment");
  }
}
