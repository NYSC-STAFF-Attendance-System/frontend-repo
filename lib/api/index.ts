import type { ApiClient } from "./types";
import { profileFromAdminSession, readAdminSession, clearAdminSession } from "./admin-session";
import { mockApi } from "./mock";
import { realApi } from "./real";

/**
 * The single object every screen talks to.
 *
 * Mock is the default for the staff app. Set NEXT_PUBLIC_USE_MOCK_API=false
 * to point every method at the Django API. The dashboard is the exception:
 * its login, staff list, invites, attendance, and office calls always use the
 * live client, because those screens are wired and the mock flag must not
 * hide them. Staff login, scan, and registration stay on the mock until each
 * one is wired.
 */
const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

const liveAdmin: ApiClient["admin"] = {
  ...mockApi.admin,
  login: (input) => realApi.admin.login(input),
  inviteAdmin: (input) => realApi.admin.inviteAdmin(input),
  listStaff: () => realApi.admin.listStaff(),
  seedStaff: (input) => realApi.admin.seedStaff(input),
  listOffices: () => realApi.admin.listOffices(),
  getOffice: (officeId) => realApi.admin.getOffice(officeId),
  updateOfficeRadius: (input) => realApi.admin.updateOfficeRadius(input),
  getOfficeQr: (officeId) => realApi.admin.getOfficeQr(officeId),
  regenerateOfficeQr: (officeId) => realApi.admin.regenerateOfficeQr(officeId),
  listAttendance: (query) => realApi.admin.listAttendance(query),
  exportAttendance: (query) => realApi.admin.exportAttendance(query),
};

const apiWithLiveAdmin: ApiClient = {
  ...mockApi,
  auth: {
    ...mockApi.auth,
    async getProfile() {
      const session = readAdminSession();
      if (session) return profileFromAdminSession(session);
      return mockApi.auth.getProfile();
    },
    async logout() {
      clearAdminSession();
      await mockApi.auth.logout();
    },
  },
  admin: liveAdmin,
};

export const api: ApiClient = useMock ? apiWithLiveAdmin : realApi;

export type { ApiClient };
