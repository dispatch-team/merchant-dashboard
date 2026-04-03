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

function parseCourierListPayload(raw: unknown): CourierProfile[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeCourierId) as CourierProfile[];
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    for (const key of ["data", "couriers", "results"]) {
      const inner = o[key];
      if (Array.isArray(inner)) {
        return inner.map(normalizeCourierId) as CourierProfile[];
      }
    }
  }
  return [];
}

/** Ensure we use the actual Courier Company ID even for partnership records. */
function normalizeCourierId(c: any): CourierProfile {
  let id = c.id;
  
  // If this is a partnership record, the actual courier company ID is often in courier_id
  // or inside the nested courier_company object.
  if (c.courier_id && (!id || id === 0)) {
    id = c.courier_id;
  }
  
  if (c.courier_company?.id) {
    // If we have the full company object, merge its fields but keep the company's own ID.
    const companyId = c.courier_company.id;
    return { ...c, ...c.courier_company, id: Number(companyId) };
  }

  const numericId = typeof id === "string" ? Number(id) : id ?? 0;
  return { ...c, id: Number.isFinite(numericId) ? numericId : id };
}


export function buildCourierLogoProxyUrl(
  logoId: string | undefined | null,
  accessToken: string | null
): string | null {
  if (logoId == null || String(logoId).trim() === "") return null;
  const raw = String(logoId).trim();
  const encodedPath = raw
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  const qs = accessToken
    ? `?token=${encodeURIComponent(accessToken)}`
    : "";
  return `/api/couriers/logo/${encodedPath}${qs}`;
}

export async function getAvailableCouriers(token: string): Promise<CourierProfile[]> {
  const res = await fetch("/api/couriers/available", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to fetch available couriers" }));
    throw new Error(error.message || error.error || "Failed to fetch available couriers");
  }
  const raw = await res.json().catch(() => []);
  return parseCourierListPayload(raw);
}

export async function getPartnerCouriers(token: string): Promise<CourierProfile[]> {
  const res = await fetch("/api/merchant/couriers", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to fetch partner couriers" }));
    throw new Error(error.message || error.error || "Failed to fetch partner couriers");
  }
  const raw = await res.json().catch(() => []);
  return parseCourierListPayload(raw);
}

export async function addPartnerCourier(token: string, courierId: number): Promise<unknown> {
  const res = await fetch("/api/merchant/couriers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ courier_id: courierId }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to add partner courier" }));
    throw new Error(error.message || error.error || "Failed to add partner courier");
  }
  return res.json().catch(() => ({}));
}

export async function removePartnerCourier(token: string, courierId: number): Promise<void> {
  const res = await fetch(`/api/merchant/couriers/${courierId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to remove partner courier" }));
    throw new Error(
      (error as { message?: string }).message ||
        (error as { error?: string }).error ||
        "Failed to remove partner courier"
    );
  }
}

/**
 * POST /api/v1/couriers/:id/rate — body `{ rating }` (10-point scale; UI sends 2…10 in steps of 2).
 */
export async function submitCourierRating(
  token: string,
  courierId: number,
  ratingOutOf10: number
): Promise<unknown> {
  const res = await fetch(`/api/couriers/${encodeURIComponent(String(courierId))}/rate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating: ratingOutOf10 }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Failed to submit rating" }));
    throw new Error(error.message || error.error || "Failed to submit rating");
  }
  return res.json().catch(() => ({}));
}

export function findCourierById(
  id: number,
  available: CourierProfile[],
  partners: CourierProfile[]
): CourierProfile | undefined {
  const matches = (c: CourierProfile) => Number(c.id) === Number(id);
  return partners.find(matches) || available.find(matches);
}

export function isCourierPartner(
  courierId: number,
  partners: CourierProfile[]
): boolean {
  return partners.some((p) => Number(p.id) === Number(courierId));
}
