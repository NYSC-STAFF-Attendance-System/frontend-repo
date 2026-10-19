import axios from "axios";
import { NO_RESPONSE_MESSAGE } from "@/lib/messages";
import type {
  AdminAttendancePage,
  AdminAttendanceQuery,
  AdminAttendanceRow,
  AdminOffice,
  AdminStaffMember,
  OfficeQrStation,
} from "@/types";
import {
  clearAdminSession,
  expireAdminSession,
  profileFromAdminSession,
  readAdminSession,
  writeAdminSession,
  type AdminRole,
  type AdminSession,
} from "./admin-session";
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
 * Wired for the dashboard (Bearer token from POST /api/auth/login/):
 *   GET  /api/staff/
 *   POST /api/staff/seed-staff/
 *   GET  /api/offices/  and  /api/offices/me/  and  /api/offices/{id}/
 *   PATCH radius on the office the admin is allowed to edit
 *   POST /api/offices/me/qr/rotate/  and  /api/offices/{id}/qr/rotate/
 *   POST /api/invites/
 *   GET  /api/attendance/admin/list/
 *   GET  /api/attendance/admin/reports/
 *
 * Not yet:
 *   POST /api/staff/login/         staff ID or email, password, device_id
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

const PUBLIC_STAFF = [
  "/api/staff/lookup",
  "/api/staff/register",
  "/api/staff/verify-email",
  "/api/staff/resend-verification",
  "/api/staff/login",
];

/** Dashboard routes only. A staff check-in must never carry this JWT. */
function needsAdminToken(url: string): boolean {
  const path = url.split("?")[0];
  if (path.startsWith("/api/attendance/check") || path.startsWith("/api/attendance/scan")) {
    return false;
  }
  if (PUBLIC_STAFF.some((prefix) => path.startsWith(prefix))) return false;
  return (
    path.startsWith("/api/offices") ||
    path.startsWith("/api/invites") ||
    path.startsWith("/api/office-admins") ||
    path.startsWith("/api/attendance/admin") ||
    path.startsWith("/api/staff")
  );
}

client.interceptors.request.use((config) => {
  const url = config.url ?? "";
  if (!needsAdminToken(url)) return config;
  const access = readAdminSession()?.access;
  if (access) {
    config.headers.set("Authorization", `Bearer ${access}`);
  }
  return config;
});

const SESSION_ENDED_MESSAGE = "Your session ended. Sign in again.";

function authorizationHeader(headers: { get?: (name: string) => unknown } | undefined): string | null {
  if (!headers) return null;
  const fromGetter = typeof headers.get === "function" ? headers.get("Authorization") : null;
  if (typeof fromGetter === "string") return fromGetter;
  const record = headers as unknown as Record<string, unknown>;
  const direct = record.Authorization ?? record.authorization;
  return typeof direct === "string" ? direct : null;
}

function bearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(\S+)/i.exec(header);
  return match?.[1] ?? null;
}

function mentionsInvalidToken(value: unknown, depth = 0): boolean {
  if (depth > 5 || value == null) return false;
  if (typeof value === "string") {
    return /token(?:[\s_-]+(?:is|has|was))?[\s_-]+(?:not[\s_-]+valid|invalid|expired)/i.test(value);
  }
  if (Array.isArray(value)) return value.some((item) => mentionsInvalidToken(item, depth + 1));
  if (typeof value === "object") {
    return Object.values(value as Json).some((item) => mentionsInvalidToken(item, depth + 1));
  }
  return false;
}

/**
 * The access token on this request is the one the dashboard is signed in with,
 * and the server refused it. Login failures never get here: that route does
 * not send the dashboard token.
 */
function rejectedAdminAccess(error: unknown): string | null {
  if (!axios.isAxiosError(error) || !error.response) return null;
  const url = error.config?.url ?? "";
  if (!needsAdminToken(url)) return null;
  const access = bearerToken(authorizationHeader(error.config?.headers));
  const current = readAdminSession()?.access;
  if (!access || !current || access !== current) return null;
  if (error.response.status === 401 || mentionsInvalidToken(error.response.data)) return access;
  return null;
}

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const access = rejectedAdminAccess(error);
    if (access) {
      expireAdminSession(access);
      if (axios.isAxiosError(error)) {
        (error as { adminSessionExpired?: boolean }).adminSessionExpired = true;
      }
    }
    return Promise.reject(error);
  },
);

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
  if (axios.isAxiosError(error) && (error as { adminSessionExpired?: boolean }).adminSessionExpired) {
    return SESSION_ENDED_MESSAGE;
  }
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

function isRecord(value: unknown): value is Json {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Unwrap `{ success, message, data }` when the backend sent the envelope. */
function dataOf(body: unknown): unknown {
  if (!isRecord(body) || !("success" in body)) return body;
  return body.data ?? null;
}

function envelopeMessage(body: unknown): string | null {
  return isRecord(body) ? text(body.message) : null;
}

function rowsOf(body: unknown): Json[] {
  const data = dataOf(body);
  if (Array.isArray(data)) return data.filter(isRecord);
  if (isRecord(data) && Array.isArray(data.results)) return data.results.filter(isRecord);
  return [];
}

function failureOf(error: unknown):
  | { kind: "offline" }
  | { kind: "forbidden" }
  | { kind: "error"; message: string } {
  if (isOffline(error)) return { kind: "offline" };
  if (statusOf(error) === 403) return { kind: "forbidden" };
  return { kind: "error", message: messageOf(error) ?? FALLBACK_MESSAGE };
}

function numberOf(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function officeFrom(value: unknown): AdminOffice | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  const name = text(value.name);
  if (!id || !name) return null;
  return {
    id,
    name,
    location: text(value.location) ?? "",
    latitude: text(value.latitude) ?? "",
    longitude: text(value.longitude) ?? "",
    radiusMeters: numberOf(value.radius_meters) ?? 0,
    isActive: value.is_active !== false,
    payloadToken: text(value.payload_token) ?? "",
  };
}

function stationFromOffice(office: AdminOffice): OfficeQrStation {
  return {
    officeId: office.id,
    officeName: office.name,
    stationId: office.id,
    stationName: office.name,
    officeType: office.location,
    radiusM: office.radiusMeters,
    enrolledStaff: 0,
    provisionedAt: "",
    lastUpdatedAt: "",
    lastUpdatedBy: "",
    token: office.payloadToken,
    payload: office.payloadToken,
    acceptingScans: office.isActive,
  };
}

function staffFrom(value: Json): AdminStaffMember {
  return {
    id: text(value.id) ?? "",
    staffId: text(value.staff_id) ?? "",
    fullName: fullNameOf(value),
    email: text(value.email),
    department: text(value.department),
    officeId: text(value.office_id) ?? "",
    officeName: text(value.office_name) ?? "",
    status: text(value.status) ?? "",
    registeredAt: text(value.registered_at),
  };
}

function attendanceFrom(value: Json): AdminAttendanceRow {
  return {
    id: text(value.id) ?? "",
    staffId: text(value.staff_id) ?? "",
    staffName: text(value.staff_name) ?? "",
    officeName: text(value.office_name) ?? "",
    location: text(value.location) ?? "",
    date: text(value.attendance_date) ?? "",
    signInAt: text(value.sign_in_at),
    signOutAt: text(value.sign_out_at),
    status: text(value.status) ?? "",
  };
}

function definedParams(input: Record<string, string | number | undefined>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(input).filter((entry): entry is [string, string | number] => {
      const value = entry[1];
      return value !== undefined && value !== "";
    }),
  );
}

function attendanceParams(query: AdminAttendanceQuery & { format?: string }) {
  return definedParams({
    page: query.page,
    page_size: query.pageSize,
    start_date: query.startDate,
    end_date: query.endDate,
    staff_id: query.staffId,
    state: query.state,
    office_id: query.officeId,
    format: query.format,
  });
}

/**
 * Office admin is locked to /me/. Superuser must name an office, except when
 * asking for the list.
 */
function officeUrl(officeId: string | undefined, suffix = "/"): string | null {
  const role: AdminRole | undefined = readAdminSession()?.role;
  if (role === "superuser") {
    return officeId ? `/api/offices/${officeId}${suffix}` : null;
  }
  return `/api/offices/me${suffix}`;
}

async function readOffice(officeId?: string): Promise<
  | { kind: "success"; office: AdminOffice }
  | { kind: "offline" }
  | { kind: "forbidden" }
  | { kind: "error"; message: string }
> {
  const path = officeUrl(officeId);
  if (!path) {
    const listed = await client.get("/api/offices/");
    const first = rowsOf(listed.data).map(officeFrom).find((office) => office !== null);
    if (!first) return { kind: "error", message: "No offices yet." };
    return { kind: "success", office: first };
  }
  const response = await client.get(path);
  const office = officeFrom(dataOf(response.data));
  if (!office) return { kind: "error", message: FALLBACK_MESSAGE };
  return { kind: "success", office };
}

function qrFailure(error: unknown): { kind: "forbidden" } | { kind: "error"; message: string } {
  const failed = failureOf(error);
  if (failed.kind === "forbidden") return failed;
  if (failed.kind === "offline") return { kind: "error", message: NO_RESPONSE_MESSAGE };
  return failed;
}

function filenameFrom(header: unknown, fallback: string): string {
  if (typeof header !== "string") return fallback;
  const match = /filename="?([^"]+)"?/.exec(header);
  return match?.[1] ?? fallback;
}

async function messageFromMaybeBlob(error: unknown): Promise<string | null> {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text()) as unknown;
      return isRecord(parsed) ? text(parsed.message) : null;
    } catch {
      return null;
    }
  }
  return messageOf(error);
}

export const realApi: ApiClient = {
  auth: {
    async login() {
      return pending();
    },
    async logout() {
      clearAdminSession();
    },
    async getProfile() {
      const session = readAdminSession();
      return session ? profileFromAdminSession(session) : null;
    },
  },

  admin: {
    // POST /api/auth/login/ with { email, password }. No device id.
    async login({ email, password }) {
      try {
        const response = await client.post("/api/auth/login/", { email, password });
        const data = dataOf(response.data);
        if (!isRecord(data)) {
          return { kind: "error", message: envelopeMessage(response.data) ?? FALLBACK_MESSAGE };
        }
        const access = text(data.access);
        const refresh = text(data.refresh) ?? "";
        const role = text(data.role);
        if (!access || (role !== "superuser" && role !== "office_admin")) {
          return {
            kind: "error",
            message: "This account cannot sign in here. Contact Headquarters.",
          };
        }
        const session: AdminSession = {
          access,
          refresh,
          role,
          email: text(data.email) ?? email,
          firstName: text(data.first_name) ?? "",
          surname: text(data.surname) ?? "",
        };
        writeAdminSession(session);
        return { kind: "success", staff: profileFromAdminSession(session) };
      } catch (error) {
        if (isOffline(error)) return { kind: "offline" };
        const status = statusOf(error);
        const message = messageOf(error) ?? "";
        if (status === 429) {
          return { kind: "rate_limited", retryAfterSeconds: retryAfterOf(error) };
        }
        if (/deactiv|banned|inactive/i.test(message)) return { kind: "account_banned" };
        if (/invite|verif/i.test(message)) return { kind: "email_not_verified", email };
        if (status === 400 || status === 401) return { kind: "invalid_credentials" };
        return { kind: "error", message: message || FALLBACK_MESSAGE };
      }
    },

    async inviteAdmin({ email, firstName, surname, officeId }) {
      try {
        const response = await client.post("/api/invites/", {
          email,
          first_name: firstName,
          surname,
          office_id: officeId,
        });
        return {
          kind: "sent",
          email,
          message: envelopeMessage(response.data) ?? "Invite sent.",
        };
      } catch (error) {
        if (isOffline(error)) return { kind: "offline" };
        const message = messageOf(error) ?? "";
        if (statusOf(error) === 403) return { kind: "forbidden" };
        if (/already/i.test(message) && /admin/i.test(message)) return { kind: "already_admin" };
        if (/not a staff|not staff|no staff/i.test(message)) return { kind: "not_staff" };
        return { kind: "error", message: message || FALLBACK_MESSAGE };
      }
    },

    async verifyAdminInvite() {
      return pending();
    },

    async listStaff() {
      try {
        const response = await client.get("/api/staff/");
        return { kind: "success", staff: rowsOf(response.data).map(staffFrom) };
      } catch (error) {
        return failureOf(error);
      }
    },

    async seedStaff(input) {
      const body: Json = {
        staff_id: input.staffId,
        surname: input.surname,
        first_name: input.firstName,
        rank: input.rank,
      };
      if (input.middleName) body.middlename = input.middleName;
      if (input.department) body.department = input.department;
      if (input.officeId) body.office_id = input.officeId;
      try {
        const response = await client.post("/api/staff/seed-staff/", body);
        const data = dataOf(response.data);
        const staffId = isRecord(data) ? text(data.staff_id) ?? input.staffId : input.staffId;
        return { kind: "created", staffId };
      } catch (error) {
        if (isOffline(error)) return { kind: "offline" };
        if (statusOf(error) === 403) return { kind: "forbidden" };
        const headline = messageOf(error);
        const fields = Object.values(fieldErrorsOf(error)).filter(
          (field) => field !== headline && !headline?.includes(field) && field.includes(" "),
        );
        const message = [headline, ...fields].filter(Boolean).join(" ");
        return { kind: "error", message: message || FALLBACK_MESSAGE };
      }
    },

    async listOffices() {
      try {
        const response = await client.get("/api/offices/");
        return {
          kind: "success",
          offices: rowsOf(response.data).flatMap((row) => {
            const office = officeFrom(row);
            return office ? [office] : [];
          }),
        };
      } catch (error) {
        return failureOf(error);
      }
    },

    async getOffice(officeId) {
      try {
        return await readOffice(officeId);
      } catch (error) {
        return failureOf(error);
      }
    },

    async updateOfficeRadius({ officeId, radiusMeters }) {
      const path = officeUrl(officeId);
      if (!path) return { kind: "error", message: "Choose an office first." };
      try {
        const response = await client.patch(path, { radius_meters: radiusMeters });
        const office = officeFrom(dataOf(response.data));
        if (!office) return { kind: "error", message: FALLBACK_MESSAGE };
        return { kind: "success", office };
      } catch (error) {
        return failureOf(error);
      }
    },

    async getOfficeQr(officeId) {
      try {
        const result = await readOffice(officeId);
        if (result.kind === "success") {
          return { kind: "success" as const, station: stationFromOffice(result.office) };
        }
        if (result.kind === "forbidden") return result;
        if (result.kind === "offline") return { kind: "error" as const, message: NO_RESPONSE_MESSAGE };
        return result;
      } catch (error) {
        return qrFailure(error);
      }
    },

    async setOfficeQrAccepting() {
      // No pause-scans route. Office-admin patch ignores is_active.
      return { kind: "error", message: "Pausing scans is not available on the server." };
    },

    async regenerateOfficeQr(officeId) {
      const path = officeUrl(officeId, "/qr/rotate/");
      if (!path) return { kind: "error", message: "Choose an office first." };
      try {
        const response = await client.post(path);
        const office = officeFrom(dataOf(response.data));
        if (!office) return { kind: "error", message: FALLBACK_MESSAGE };
        return { kind: "success", station: stationFromOffice(office) };
      } catch (error) {
        return qrFailure(error);
      }
    },

    async listAttendance(query) {
      try {
        const response = await client.get("/api/attendance/admin/list/", {
          params: attendanceParams(query),
        });
        const data = dataOf(response.data);
        const record = isRecord(data) ? data : {};
        const page: AdminAttendancePage = {
          count: numberOf(record.count) ?? rowsOf(response.data).length,
          page: numberOf(record.page) ?? query.page ?? 1,
          pageSize: numberOf(record.page_size) ?? query.pageSize ?? 20,
          results: rowsOf(response.data).map(attendanceFrom),
        };
        return { kind: "success", page };
      } catch (error) {
        return failureOf(error);
      }
    },

    async exportAttendance(query) {
      try {
        const response = await client.get("/api/attendance/admin/reports/", {
          params: attendanceParams(query),
          responseType: "blob",
        });
        const blob = response.data as Blob;
        return {
          kind: "success",
          blob,
          filename: filenameFrom(
            response.headers["content-disposition"],
            `attendance-report.${query.format}`,
          ),
        };
      } catch (error) {
        if (isOffline(error)) return { kind: "offline" };
        if (statusOf(error) === 403) return { kind: "forbidden" };
        const message = await messageFromMaybeBlob(error);
        return { kind: "error", message: message ?? FALLBACK_MESSAGE };
      }
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
