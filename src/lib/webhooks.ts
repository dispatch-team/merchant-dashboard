export interface Webhook {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  merchant_id: number;
  url: string;
  is_active: boolean;
  signing_key?: string; // Only present on creation
}

export interface WebhookRegistrationResponse {
  signing_key: string;
  webhook_id: number;
}

export async function getWebhooks(token: string): Promise<Webhook[]> {
  const res = await fetch("/api/merchant/webhooks", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to fetch webhooks");
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function registerWebhook(token: string, url: string): Promise<WebhookRegistrationResponse> {
  const res = await fetch("/api/merchant/webhooks", {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url }), // Assuming the backend expectation
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to register webhook");
  }
  return res.json();
}

export async function deleteWebhook(token: string, id: number): Promise<void> {
  const res = await fetch(`/api/merchant/webhooks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to delete webhook");
  }
}
