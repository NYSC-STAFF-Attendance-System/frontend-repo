import axios from "axios";
import type { ApiClient } from "./types";

/**
 * Real Django client. Used when NEXT_PUBLIC_USE_MOCK_API=false.
 *
 * Every method already has the right signature. Wiring one means writing the
 * request and mapping the response onto its union, and no screen changes.
 *
 * Wired so far - registration, all public:
 *   GET  /api/staff/lookup/{staff_id}/
 *   POST /api/staff/register/
 *   POST /api/staff/verify-email/
 *   POST /api/staff/resend-verification/
 *
 * Not yet - these need the signed-in session stored first:
 *   POST /api/staff/login/         staff ID or email, password, device_id
 *   POST /api/auth/login/          admin email and password, no device
 *   GET  /api/attendance/scan/?t=  resolve a QR token, no geofence
 *   POST /api/attendance/check/    record Sign In or Sign Out, geofence enforced
 *
 * Backend field names are snake_case and the app's are camelCase. All
 * translation happens in this file, so no type or screen has to know.
 */

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/** Placeholder until each method is wired. Keeps the no-throw contract. */
function pending(): { kind: "error"; message: string } {
  return { kind: "error", message: "The live API is not connected yet." };
}

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

type Json = Record<string, unknown>;

/**
 * Every backend response, success or failure, is wrapped:
 *
 *   { "success": false, "message": "Staff not found.", "data": null }
 *
 * This returns the useful part. It also accepts an unwrapped body, because the
 * API schema documents some responses without the wrapper and it costs nothing
 * to handle both.
 */
function payloadOf(body: unknown): Json {
  if (!body || typeof body !== "object") return {};
  const object = body as Json;
  if ("success" in object && object.data && typeof object.data === "object") {
    return object.data as Json;
  }
  return object;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/** "first_name middlename surname" from the separate name fields. */
function fullNameOf(data: Json): string {
  return [data.first_name, data.middlename, data.surname]
    .map(text)
    .filter((part): part is string => part !== null)
    .join(" ");
}

/**
 * True when the request never reached the server - no network, DNS failure, or
 * CORS refusal. axios reports all of these as an error with no response.
 */
function isOffline(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

function statusOf(error: unknown): number | null {
  return axios.isAxiosError(error) ? (error.response?.status ?? null) : null;
}

/** The backend's own message for a failed request, if it sent one. */
function messageOf(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const body = error.response?.data;
  return body && typeof body === "object" ? text((body as Json).message) : null;
}

/**
 * Field errors in Django REST style - { "staff_id": ["This field is required."] }
 * - turned into { staffId: "This field is required." }, so each message can
 * land under the form field that caused it.
 */
function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) return {};
  const data = payloadOf(error.response?.data);
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    const first = Array.isArray(value) ? text(value[0]) : text(value);
    if (!first) continue;
    const camel = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
    result[camel] = first;
  }
  return result;
}

/** Seconds to wait from a 429's Retry-After header, when the backend sends one. */
function retryAfterOf(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;
  const raw = Number(error.response?.headers?.["retry-after"]);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

export const realApi: ApiClient = {
  auth: {
    async login() {
      return pending();
    },
    async logout() {
      // No session to clear until login is wired.
    },
    async getProfile() {
      return null;
    },
  },

  admin: {
    // POST /api/auth/login/ with { email, password }. Waits on the admin
    // session being stored separately from the staff one.
    async login() {
      return pending();
    },
    async inviteAdmin() {
      return pending();
    },
    async verifyAdminInvite() {
      return pending();
    },
    async getOfficeQr() {
      return pending();
    },
    async setOfficeQrAccepting() {
      return pending();
    },
    async regenerateOfficeQr() {
      return pending();
    },
  },

  /**
   * Public endpoints: no token, no session. These are wired to the live backend.
   *
   * The backend sends readable messages but no error codes, so where two
   * failures share a status code they are told apart by their wording. That is
   * fragile - a reworded message would break it - and is marked PROVISIONAL
   * below. Ask the backend to add a stable code field and switch to that.
   */
  registration: {
    // GET /api/staff/lookup/{staff_id}/
    async lookupStaffId(staffId) {
      const id = staffId.trim();
      try {
        const response = await client.get(`/api/staff/lookup/${encodeURIComponent(id)}/`);
        const data = payloadOf(response.data);
        return {
          kind: "found",
          staff: {
            staffId: text(data.staff_id) ?? id,
            fullName: fullNameOf(data),
            officeName: null,
          },
        };
      } catch (error) {
        if (isOffline(error)) return { kind: "offline" };
        const message = messageOf(error);
        // PROVISIONAL: checked before 404, in case the backend reports a
        // claimed record as "not found" with different wording.
        if (message && /regist/i.test(message)) {
          return { kind: "already_registered", staffId: id };
        }
        if (statusOf(error) === 404) return { kind: "not_found" };
        return { kind: "error", message: message ?? FALLBACK_MESSAGE };
      }
    },

    // POST /api/staff/register/
    async register({ staffId, email, phone, password, deviceId }) {
      try {
        await client.post("/api/staff/register/", {
          staff_id: staffId,
          email,
          phone,
          password,
          device_id: deviceId,
        });
        return { kind: "success", email };
      } catch (error) {
        if (isOffline(error)) return { kind: "offline" };
        const message = messageOf(error);
        // PROVISIONAL: claimed while the person was filling in the form.
        if (message && /already/i.test(message) && /regist/i.test(message)) {
          return { kind: "already_registered" };
        }
        const fieldErrors = fieldErrorsOf(error);
        if (statusOf(error) === 400 && Object.keys(fieldErrors).length > 0) {
          return { kind: "invalid_details", fieldErrors };
        }
        return { kind: "error", message: message ?? FALLBACK_MESSAGE };
      }
    },

    // POST /api/staff/verify-email/
    async verifyEmail(token) {
      try {
        await client.post("/api/staff/verify-email/", { token });
        return { kind: "verified" };
      } catch (error) {
        if (isOffline(error)) return { kind: "offline" };
        const message = messageOf(error) ?? "";
        // PROVISIONAL: all three arrive as 400 with only the wording to tell
        // them apart. A bad token is confirmed as "Invalid verification token."
        if (/expired/i.test(message)) return { kind: "expired_token" };
        if (/already/i.test(message)) return { kind: "already_verified" };
        const status = statusOf(error);
        if (status === 400 || status === 404) return { kind: "invalid_token" };
        return { kind: "error", message: message || FALLBACK_MESSAGE };
      }
    },

    // POST /api/staff/resend-verification/
    async resendVerification(staffId) {
      try {
        await client.post("/api/staff/resend-verification/", { staff_id: staffId.trim() });
        return { kind: "sent" };
      } catch (error) {
        if (isOffline(error)) return { kind: "offline" };
        if (statusOf(error) === 429) {
          return { kind: "rate_limited", retryAfterSeconds: retryAfterOf(error) };
        }
        return { kind: "error", message: messageOf(error) ?? FALLBACK_MESSAGE };
      }
    },
  },

  password: {
    async requestReset() {
      return pending();
    },
    async reset() {
      return pending();
    },
    async change() {
      return pending();
    },
  },

  attendance: {
    async resolveToken() {
      return pending();
    },
    async submit() {
      return pending();
    },
    async today() {
      return pending();
    },
    async history() {
      return pending();
    },
  },
};
