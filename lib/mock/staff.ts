import type { StaffLookupResult, StaffProfile } from "@/types";
import { mockDepartments, mockOffice } from "./office";

/** Staff-app login: this ID (or email) plus any password of 8+ characters. */
export const MOCK_STAFF_PASSWORD_HINT = "password1";

/** Admin dashboard login uses email, not staff ID. */
export const MOCK_ADMIN_PASSWORD = "NyscAdmin1";

/** Open /invite-admin?token=admin_invite_ok to promote Chinedu to admin. */
export const MOCK_ADMIN_INVITE_TOKEN = "admin_invite_ok";

/**
 * The signed-in staff member for the staff-app prototype.
 * /admin is 404 for this account until a super-admin invite is verified.
 */
export const mockStaff: StaffProfile = {
  staffId: "NYSC/FCT/0842",
  fullName: "Chinedu Ibrahim",
  email: "c.ibrahim@nysc.gov.ng",
  rank: "Senior Officer II",
  department: mockDepartments[0],
  office: { id: mockOffice.id, name: mockOffice.name },
  accountStatus: "active",
  role: "staff",
  emailVerified: true,
  deviceBoundAt: "2026-08-03T09:14:00+01:00",
};

/**
 * A banned account, for building /blocked and the wrong-account states without
 * mutating the main fixture.
 */
export const mockBannedStaff: StaffProfile = {
  ...mockStaff,
  staffId: "NYSC/FCT/0619",
  fullName: "Amina Bello",
  email: "a.bello@nysc.gov.ng",
  accountStatus: "banned",
  role: "staff",
};

/**
 * Already invited and verified. Signs into /admin with email + MOCK_ADMIN_PASSWORD.
 */
export const mockAdmin: StaffProfile = {
  staffId: "NYSC/FCT/0101",
  fullName: "Ibrahim Bello",
  email: "i.bello@nysc.gov.ng",
  rank: "State Coordinator",
  department: mockDepartments[0],
  office: { id: mockOffice.id, name: mockOffice.name },
  accountStatus: "active",
  role: "admin",
  emailVerified: true,
  deviceBoundAt: "2026-07-12T10:00:00+01:00",
};

/** Sends admin invites. Same password as mockAdmin. */
export const mockSuperAdmin: StaffProfile = {
  staffId: "NYSC/FCT/0001",
  fullName: "Ngozi Adeyemi",
  email: "super.admin@nysc.gov.ng",
  rank: "Director, ICT",
  department: mockDepartments[0],
  office: { id: mockOffice.id, name: mockOffice.name },
  accountStatus: "active",
  role: "super_admin",
  emailVerified: true,
  deviceBoundAt: "2026-01-08T08:00:00+01:00",
};

export const mockAccounts: StaffProfile[] = [
  mockStaff,
  mockBannedStaff,
  mockAdmin,
  mockSuperAdmin,
];

export function isAdminRole(role: StaffProfile["role"]): boolean {
  return role === "admin" || role === "super_admin";
}

/**
 * Staff records an admin has created but nobody has claimed yet. Step one of
 * /register looks up against this list.
 *
 * Note the deliberate second entry: a record that has already been claimed, so
 * the "this staff ID is already registered" branch has something to hit.
 */
export const mockLookupResults: StaffLookupResult[] = [
  {
    staffId: "NYSC/FCT/0842",
    fullName: "Chinedu Ibrahim",
    officeName: mockOffice.name,
    alreadyRegistered: false,
  },
  {
    staffId: "NYSC/FCT/0619",
    fullName: "Amina Bello",
    officeName: mockOffice.name,
    alreadyRegistered: true,
  },
];
