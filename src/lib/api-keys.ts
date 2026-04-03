export interface APIKeyMetadata {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  merchant_id: number;
  last_used_at: string;
}

export interface GeneratedAPIKey {
  api_key: string;
}

export async function getAPIKeys(token: string): Promise<APIKeyMetadata[]> {
  const res = await fetch("/api/merchant/api-keys", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to fetch API keys");
  }
  const data = await res.json();
  // Ensure we return an array
  return Array.isArray(data) ? data : (data.api_keys || []);
}

export async function generateAPIKey(token: string): Promise<GeneratedAPIKey> {
  const res = await fetch("/api/merchant/api-keys", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to generate API key");
  }
  return res.json();
}
