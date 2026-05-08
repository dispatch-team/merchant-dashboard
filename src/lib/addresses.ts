export interface AddressParseResult {
  subcity: string;
  landmark: string;
  latitude: number;
  longitude: number;
  confidence: number;
  script: string;
}

export interface AutocompleteResult {
  name: string;
  subcity: string;
  category: string;
  lat: number;
  lng: number;
  score: number;
}

export interface AutocompleteResponse {
  results: AutocompleteResult[];
  query_time_ms: number;
}

const BASE_URL = "/api/addresses";

export async function parseAddress(token: string, address: string): Promise<AddressParseResult> {
  const res = await fetch(`${BASE_URL}/parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to parse address");
  }

  return data as AddressParseResult;
}

export async function autocompleteAddress(token: string, query: string): Promise<AutocompleteResponse> {
  const res = await fetch(`${BASE_URL}/autocomplete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to autocomplete address");
  }

  return data as AutocompleteResponse;
}
