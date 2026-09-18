/**
 * The station QR an office prints for staff to scan.
 *
 * The token is what /scan reads from ?t=. The payload string is a public
 * identifier shown to admins; it is not a second secret.
 */
export type OfficeQrStation = {
  officeId: string;
  officeName: string;
  stationId: string;
  stationName: string;
  officeType: string;
  radiusM: number;
  enrolledStaff: number;
  provisionedAt: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  token: string;
  payload: string;
  acceptingScans: boolean;
};

export type OfficeQrResult =
  | { kind: "success"; station: OfficeQrStation }
  | { kind: "forbidden" }
  | { kind: "error"; message: string };
