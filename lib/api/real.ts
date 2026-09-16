import axios from "axios";
import type { ApiClient } from "./types";

/**
 * Real Django client. Not implemented yet - the prototype runs entirely on the
 * mock.
 *
 * It exists now, rather than later, so the shape of the swap is visible from
 * day one. Every method below is already the right signature; filling one in
 * means writing the request and mapping the response onto the union, and no
 * screen changes when it happens.
 *
 * Endpoints this will call, from the phased build plan:
 *   POST /api/staff/register/      claim a record, bind the device
 *   POST /api/staff/login/         credentials plus device_id
 *   GET  /api/attendance/scan/?t=  resolve a QR token, no geofence
 *   POST /api/attendance/check/    record Sign In or Sign Out, geofence enforced
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

  registration: {
    async lookupStaffId() {
      return pending();
    },
    async register() {
      return pending();
    },
    async verifyEmail() {
      return pending();
    },
    async resendVerification() {
      return pending();
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

// Referenced so the configured instance is not dropped by tree shaking before
// the methods above are written.
export { client as apiClient };
