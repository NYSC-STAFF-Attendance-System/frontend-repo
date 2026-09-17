import { MOCK_VALID_TOKEN } from "./scan";
import { mockOffice } from "./office";
import type { OfficeQrStation } from "@/types";

export const MOCK_OFFICE_QR_PROVISIONED_AT = "Oct 12, 2023 · 09:14 AM";

export function mockOfficeQrStation(input: {
  token: string;
  acceptingScans: boolean;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}): OfficeQrStation {
  return {
    officeId: mockOffice.id,
    officeName: "FCT Abuja Central Secretariat",
    stationId: "HQ-ABJ-01",
    stationName: "Maitama Central Secretariat Centroid",
    officeType: "Central Secretariat",
    radiusM: 50,
    enrolledStaff: 142,
    provisionedAt: MOCK_OFFICE_QR_PROVISIONED_AT,
    lastUpdatedAt: input.lastUpdatedAt,
    lastUpdatedBy: input.lastUpdatedBy,
    token: input.token,
    payload: `nysc://office/verify?station=HQ-ABJ-01&t=${input.token}`,
    acceptingScans: input.acceptingScans,
  };
}

export function defaultOfficeQrStation(): OfficeQrStation {
  return mockOfficeQrStation({
    token: MOCK_VALID_TOKEN,
    acceptingScans: true,
    lastUpdatedAt: MOCK_OFFICE_QR_PROVISIONED_AT,
    lastUpdatedBy: "Ibrahim Bello (State Coordinator)",
  });
}
