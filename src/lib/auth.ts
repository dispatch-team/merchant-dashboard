const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!;

export type UserRole = "merchant" | "supervisor" | "admin" | "courier" | "driver";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  session_state: string;
}

export interface UserInfo {
  sub: string;
  email: string;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  roles: UserRole[];
}

export interface AuthError {
  code: "INVALID_CREDENTIALS" | "ACCOUNT_DISABLED" | "ACCOUNT_LOCKED" | "NETWORK_ERROR" | "UNKNOWN";
  message: string;
}

function parseJwtPayload(token: string): Record<string, unknown> {
  let base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const json = atob(base64);
  return JSON.parse(json);
}

export function extractUserInfo(accessToken: string): UserInfo {
  const payload = parseJwtPayload(accessToken);
  const clientRoles =
    (payload.resource_access as Record<string, { roles: string[] }>)?.[CLIENT_ID]?.roles ?? [];

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    name: payload.name as string,
    preferred_username: payload.preferred_username as string,
    given_name: payload.given_name as string,
    family_name: payload.family_name as string,
    roles: clientRoles as UserRole[],
  };
}

export function isTokenExpired(accessToken: string): boolean {
  try {
    const payload = parseJwtPayload(accessToken);
    const exp = payload.exp as number;
    return Date.now() >= (exp - 30) * 1000;
  } catch {
    return true;
  }
}

// 🔐 Keycloak Login (unchanged)
export async function login(username: string, password: string): Promise<TokenResponse> {
  let res: Response;
  try {
    res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw { code: "NETWORK_ERROR", message: "Unable to reach the authentication server." } as AuthError;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const desc = (body as { error_description?: string }).error_description ?? "";
    const error = (body as { error?: string }).error ?? "";

    if (error === "invalid_grant") {
      if (desc.toLowerCase().includes("disabled")) {
        throw { code: "ACCOUNT_DISABLED", message: "This account has been deactivated. Contact your administrator." } as AuthError;
      }
      if (desc.toLowerCase().includes("locked")) {
        throw { code: "ACCOUNT_LOCKED", message: "Account temporarily locked. Please try again later." } as AuthError;
      }
      throw { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } as AuthError;
    }

    if (error === "unauthorized_client") {
      throw { code: "UNKNOWN", message: "Authentication service misconfigured. Contact your administrator." } as AuthError;
    }

    // Support Go backend `{ error: "...", code: "..." }` responses
    if (error) {
      throw { code: (body as any).code || "UNKNOWN", message: error } as AuthError;
    }

    throw { code: "UNKNOWN", message: "Authentication failed. Please try again." } as AuthError;
  }

  return res.json();
}

// 🔁 Refresh token
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  return res.json();
}

// 🚪 Logout
export async function logout(refreshToken: string): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    // silently fail
  }
}

// 🆕 Merchant Registration (FIXED + CORS SAFE)
export async function registerMerchant(
  payload: Record<string, string>
): Promise<any> {
  let res: Response;

  try {
    res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw {
      code: "NETWORK_ERROR",
      message: "Unable to reach the server.",
    } as AuthError;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw {
      code: "UNKNOWN",
      message: data.message || data.error || "Registration failed",
    } as AuthError;
  }

  return data;
}

// 💾 Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "dispatch_access_token",
  REFRESH_TOKEN: "dispatch_refresh_token",
} as const;

export function persistTokens(tokens: TokenResponse): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  // Add cookie for API routes (like logo proxy) and middleware
  document.cookie = `dispatch_access_token=${tokens.access_token}; path=/; max-age=${tokens.expires_in}; SameSite=Lax`;
}

export function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  };
}

export function clearStoredTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  // Clear cookie
  document.cookie = "dispatch_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}