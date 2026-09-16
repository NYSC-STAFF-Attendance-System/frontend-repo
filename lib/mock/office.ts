import type { Department, Office } from "@/types";

/**
 * Departments used across the mock data. Kept as entities rather than loose
 * strings so the staff profile and any future filter agree on the same ids.
 */
export const mockDepartments: Department[] = [
  { id: "dep_ict", name: "ICT and Support Services" },
  { id: "dep_finance", name: "Finance and Accounts" },
  { id: "dep_planning", name: "Planning, Research and Statistics" },
];

/** The office our mock staff member belongs to. */
export const mockOffice: Office = {
  id: "off_fct_hq",
  name: "NYSC FCT Secretariat",
  state: "FCT",
  isActive: true,
};

/**
 * A deactivated office, so the /scan "office inactive" state can be built
 * against real data rather than a hand-written placeholder.
 */
export const mockInactiveOffice: Office = {
  id: "off_fct_gwagwalada",
  name: "NYSC Gwagwalada Area Office",
  state: "FCT",
  isActive: false,
};
