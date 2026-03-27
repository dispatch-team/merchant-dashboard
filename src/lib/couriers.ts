export interface CourierProfile {
  id: number;
  company_name: string;
  company_address: string;
  status: string;
  company_logo_id?: string;
  phone_number: string;
  email: string;
  website_url?: string;
  rating_aggregate: number;
  rating_count: number;
  max_weight: number;
  base_price: number;
  weight_rate: number;
  distance_rate: number;
  time_rate: number;
}

export async function getAvailableCouriers(token: string): Promise<CourierProfile[]> {
  const res = await fetch("/api/couriers/available", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to fetch available couriers" }));
    throw new Error(error.message || error.error || "Failed to fetch available couriers");
  }
  return res.json();
}

export async function getPartnerCouriers(token: string): Promise<CourierProfile[]> {
  const res = await fetch("/api/merchant/couriers", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to fetch partner couriers" }));
    throw new Error(error.message || error.error || "Failed to fetch partner couriers");
  }
  return res.json();
}

export async function addPartnerCourier(token: string, courierId: number): Promise<any> {
  const res = await fetch("/api/merchant/couriers", {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ courier_id: courierId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to add partner courier" }));
    throw new Error(error.message || error.error || "Failed to add partner courier");
  }
  return res.json();
}
