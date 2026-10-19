/**
 * Dashboard records, shaped the way the screens render them.
 *
 * The wire format is snake_case and lives in the real client. These types are
 * what a screen is allowed to read.
 */

export type AdminOffice = {
  id: string;
  name: string;
  location: string;
  latitude: string;
  longitude: string;
  radiusMeters: number;
  isActive: boolean;
  payloadToken: string;
};

export type AdminStaffMember = {
  id: string;
  staffId: string;
  fullName: string;
  email: string | null;
  department: string | null;
  officeId: string;
  officeName: string;
  status: string;
  registeredAt: string | null;
};

export type AdminAttendanceRow = {
  id: string;
  staffId: string;
  staffName: string;
  officeName: string;
  location: string;
  date: string;
  signInAt: string | null;
  signOutAt: string | null;
  status: string;
};

export type AdminAttendanceQuery = {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  staffId?: string;
  state?: string;
  officeId?: string;
};

export type AdminAttendancePage = {
  count: number;
  page: number;
  pageSize: number;
  results: AdminAttendanceRow[];
};

export type AdminFailure =
  | { kind: "forbidden" }
  | { kind: "offline" }
  | { kind: "error"; message: string };

export type AdminStaffListResult = { kind: "success"; staff: AdminStaffMember[] } | AdminFailure;

/** One row for POST /api/staff/seed-staff/. */
export type SeedStaffInput = {
  staffId: string;
  surname: string;
  firstName: string;
  middleName?: string;
  rank: string;
  department?: string;
  officeId?: string;
};

export type SeedStaffResult = { kind: "created"; staffId: string } | AdminFailure;

export type AdminOfficeListResult = { kind: "success"; offices: AdminOffice[] } | AdminFailure;

export type AdminOfficeResult = { kind: "success"; office: AdminOffice } | AdminFailure;

export type AdminAttendanceListResult =
  | { kind: "success"; page: AdminAttendancePage }
  | AdminFailure;

export type AdminExportResult =
  | { kind: "success"; filename: string; blob: Blob }
  | AdminFailure;
