export interface NormalizedMerchantProfile {
  id?: number;
  first_name: string;
  last_name: string;
  company_name: string;
  company_address: string;
  industry: string;
  description: string;
  phone_number: string;
  email: string;
  website_url: string;
  company_logo_id?: string;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function nestedRecordLooksLikeUser(o: Record<string, unknown>): boolean {
  return (
    "first_name" in o ||
    "firstName" in o ||
    "given_name" in o ||
    "givenName" in o ||
    "last_name" in o ||
    "lastName" in o ||
    "family_name" in o ||
    "familyName" in o ||
    "email" in o
  );
}

function profileLooksLikeMerchant(o: Record<string, unknown>): boolean {
  return (
    "company_name" in o ||
    "companyName" in o ||
    "email" in o ||
    "company_address" in o ||
    "companyAddress" in o ||
    "phone_number" in o ||
    "phoneNumber" in o ||
    "first_name" in o ||
    "firstName" in o ||
    "given_name" in o ||
    "givenName" in o ||
    "family_name" in o ||
    "familyName" in o ||
    "name" in o ||
    "full_name" in o ||
    "fullName" in o ||
    "company_logo_id" in o ||
    "companyLogoId" in o ||
    (isPlainObject(o.company_logo) && "id" in o.company_logo) ||
    (isPlainObject(o.user) && nestedRecordLooksLikeUser(o.user)) ||
    (isPlainObject(o.merchant_user) && nestedRecordLooksLikeUser(o.merchant_user)) ||
    (isPlainObject(o.merchantUser) && nestedRecordLooksLikeUser(o.merchantUser)) ||
    (isPlainObject(o.account) && nestedRecordLooksLikeUser(o.account))
  );
}

/** Unwrap common API envelopes and pick the object that holds merchant fields. */
export function extractProfilePayload(raw: unknown): Record<string, unknown> | null {
  if (!isPlainObject(raw)) return null;

  const candidates = ["data", "profile", "merchant", "result", "payload"] as const;
  for (const key of candidates) {
    const inner = raw[key];
    if (isPlainObject(inner) && profileLooksLikeMerchant(inner)) {
      return inner;
    }
  }

  if (profileLooksLikeMerchant(raw)) return raw;

  const data = raw.data;
  if (isPlainObject(data)) return data;

  return raw;
}

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v === null || v === undefined) continue;
    const s = String(v).trim();
    if (s !== "") return s;
  }
  return "";
}

const USER_LIKE_NEST_KEYS = ["user", "merchant_user", "merchantUser", "account"] as const;

function pickFirstLastName(obj: Record<string, unknown>): {
  first_name: string;
  last_name: string;
} {
  let first_name = pickStr(
    obj,
    "first_name",
    "firstName",
    "given_name",
    "givenName"
  );
  let last_name = pickStr(
    obj,
    "last_name",
    "lastName",
    "family_name",
    "familyName"
  );

  for (const key of USER_LIKE_NEST_KEYS) {
    const inner = obj[key];
    if (!isPlainObject(inner)) continue;
    if (!first_name) {
      first_name = pickStr(
        inner,
        "first_name",
        "firstName",
        "given_name",
        "givenName"
      );
    }
    if (!last_name) {
      last_name = pickStr(
        inner,
        "last_name",
        "lastName",
        "family_name",
        "familyName"
      );
    }
  }

  const full = pickStr(obj, "name", "full_name", "fullName");
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean);
    if (!first_name && parts.length) first_name = parts[0];
    if (!last_name && parts.length > 1) last_name = parts.slice(1).join(" ");
  }

  return { first_name, last_name };
}

function pickLogoId(obj: Record<string, unknown>): string | undefined {
  const direct = obj.company_logo_id ?? obj.companyLogoId;
  if (direct !== null && direct !== undefined && String(direct).trim() !== "") {
    return String(direct).trim();
  }
  const nested = obj.company_logo;
  if (isPlainObject(nested)) {
    const id = nested.id ?? nested.ID;
    if (id !== null && id !== undefined && String(id).trim() !== "") {
      return String(id).trim();
    }
  }
  return undefined;
}

/**
 * Strip URL / duplicated path prefixes so the Next.js logo proxy receives only the id segment(s)
 * the upstream expects after .../merchants/logos/.
 */
export function sanitizeLogoIdForProxy(raw: string): string {
  let s = raw.trim();
  if (!s) return "";

  if (/^https?:\/\//i.test(s)) {
    try {
      s = new URL(s).pathname.replace(/^\/+/, "");
    } catch {
      s = s.replace(/^\/+/, "");
    }
  }

  const prefixes = [
    "api/v1/merchants/logos/",
    "v1/merchants/logos/",
    "merchants/logos/",
  ];
  const lower = s.toLowerCase();
  for (const p of prefixes) {
    if (lower.startsWith(p)) {
      s = s.slice(p.length);
      break;
    }
  }

  return s.replace(/^\/+/, "").replace(/\/+$/, "");
}

export function buildMerchantLogoProxyUrl(
  logoId: string | undefined,
  accessToken: string | null
): string | null {
  if (!logoId) return null;
  const path = sanitizeLogoIdForProxy(logoId);
  if (!path) return null;

  const encodedPath = path
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");

  const qs = accessToken
    ? `?token=${encodeURIComponent(accessToken)}`
    : "";
  return `/api/merchant/logo/${encodedPath}${qs}`;
}

/** Normalize merchant profile JSON from the backend into the shape the dashboard uses. */
export function normalizeMerchantProfile(raw: unknown): NormalizedMerchantProfile | null {
  const obj = extractProfilePayload(raw);
  if (!obj || !profileLooksLikeMerchant(obj)) return null;

  const logoId = pickLogoId(obj);
  const { first_name, last_name } = pickFirstLastName(obj);

  return {
    id: typeof obj.id === "number" ? obj.id : Number(obj.id) || undefined,
    first_name,
    last_name,
    company_name: pickStr(obj, "company_name", "companyName"),
    company_address: pickStr(obj, "company_address", "companyAddress"),
    industry: pickStr(obj, "industry"),
    description: pickStr(obj, "description"),
    phone_number: pickStr(obj, "phone_number", "phoneNumber"),
    email: pickStr(obj, "email"),
    website_url: pickStr(obj, "website_url", "websiteUrl"),
    company_logo_id: logoId,
  };
}

/** When the API omits personal names, fill from JWT claims (Keycloak-style). */
export type AuthUserNameFields = {
  given_name?: string;
  family_name?: string;
  name?: string;
};

export function mergeMerchantProfileWithJwtUser(
  profile: NormalizedMerchantProfile,
  user: AuthUserNameFields | null | undefined
): NormalizedMerchantProfile {
  if (!user) return profile;

  let first_name = profile.first_name.trim()
    ? profile.first_name
    : (user.given_name || "").trim();
  let last_name = profile.last_name.trim()
    ? profile.last_name
    : (user.family_name || "").trim();

  if (!first_name && !last_name && user.name?.trim()) {
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    first_name = parts[0] || "";
    last_name = parts.length > 1 ? parts.slice(1).join(" ") : "";
  }

  return { ...profile, first_name, last_name };
}

export function merchantApiErrorMessage(body: unknown): string {
  if (!isPlainObject(body)) return "Request failed";

  const msg =
    body.message ??
    body.error ??
    body.error_description ??
    body.detail;

  if (typeof msg === "string" && msg.trim()) return msg;
  if (Array.isArray(msg)) {
    const parts = msg
      .map((x) => (typeof x === "string" ? x : JSON.stringify(x)))
      .filter(Boolean);
    if (parts.length) return parts.join(", ");
  }

  if (isPlainObject(msg) && typeof msg.message === "string") return msg.message;

  return "Request failed";
}
