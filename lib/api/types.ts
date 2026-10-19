import type {
  AdminAttendanceListResult,
  AdminAttendanceQuery,
  AdminExportResult,
  AdminOfficeListResult,
  AdminOfficeResult,
  AdminStaffListResult,
  SeedStaffInput,
  SeedStaffResult,
  AttendanceOutcome,
  ChangePasswordResult,
  Coordinates,
  HistoryPeriod,
  HistoryResult,
  InviteAdminResult,
  LoginResult,
  OfficeQrResult,
  PasswordResetRequestResult,
  RegisterResult,
  ResetPasswordResult,
  ScanResolution,
  StaffLookupOutcome,
  StaffProfile,
  TodayResult,
  VerifyAdminInviteResult,
  VerifyEmailResult,
} from "@/types";

/**
 * The whole surface the staff app is allowed to touch.
 *
 * Screens depend on this shape and nothing else. The mock and the real Django
 * client both implement it, so switching between them changes one import and no
 * components. If a method is not on here, no screen can call it.
 *
 * Note that nothing throws. Every method resolves to a union describing what
 * happened, including failure. Exceptions are easy to forget to catch; a union
 * the compiler makes you destructure is not.
 */
export type ApiClient = {
  auth: {
    login(input: {
      staffIdOrEmail: string;
      password: string;
      deviceId: string;
    }): Promise<LoginResult>;

    logout(): Promise<void>;

    /** Null when nobody is signed in. Drives the redirect on protected routes. */
    getProfile(): Promise<StaffProfile | null>;
  };

  admin: {
    /**
     * Dashboard sign-in. Email and password only, with no device ID.
     *
     * Separate from auth.login because the backend has a separate admin login
     * (POST /api/auth/login/) that does not check the device. Sending admins
     * through the staff login would block anyone signing in from a computer
     * that is not their registered phone.
     *
     * Returns the same LoginResult as staff login for now, so the signed-in
     * person lands in the same place in the app. That changes when admin and
     * staff sessions are stored separately.
     */
    login(input: { email: string; password: string }): Promise<LoginResult>;

    /**
     * Super admin only. POST /api/invites/ with the name and office the
     * invitee will belong to. The server sends the email.
     */
    inviteAdmin(input: {
      email: string;
      firstName: string;
      surname: string;
      officeId: string;
    }): Promise<InviteAdminResult>;

    /** Public. Following the invite email upgrades that staff to admin. */
    verifyAdminInvite(token: string): Promise<VerifyAdminInviteResult>;

    /** GET /api/staff/ — every staff row this admin is allowed to see. */
    listStaff(): Promise<AdminStaffListResult>;

    /**
     * POST /api/staff/seed-staff/. One pending registration. A CSV upload
     * calls this once per row.
     */
    seedStaff(input: SeedStaffInput): Promise<SeedStaffResult>;

    /** GET /api/offices/ — superuser. Office admins receive forbidden. */
    listOffices(): Promise<AdminOfficeListResult>;

    /**
     * One office. Superuser passes an id (GET /api/offices/{id}/). An office
     * admin omits it and hits GET /api/offices/me/.
     */
    getOffice(officeId?: string): Promise<AdminOfficeResult>;

    /** PATCH radius_meters. The only settings field the API stores. */
    updateOfficeRadius(input: {
      officeId?: string;
      radiusMeters: number;
    }): Promise<AdminOfficeResult>;

    /** The printed station QR staff scan to open /scan. */
    getOfficeQr(officeId?: string): Promise<OfficeQrResult>;
    setOfficeQrAccepting(accepting: boolean): Promise<OfficeQrResult>;
    regenerateOfficeQr(officeId?: string): Promise<OfficeQrResult>;

    /** GET /api/attendance/admin/list/ */
    listAttendance(query: AdminAttendanceQuery): Promise<AdminAttendanceListResult>;

    /** GET /api/attendance/admin/reports/?format=csv|xlsx */
    exportAttendance(
      query: AdminAttendanceQuery & { format: "csv" | "xlsx" },
    ): Promise<AdminExportResult>;
  };

  registration: {
    /** Step one: is this staff ID on the admin-created list, and unclaimed? */
    lookupStaffId(staffId: string): Promise<StaffLookupOutcome>;

    /** Step three: claim the record. Binds this phone permanently. */
    register(input: {
      staffId: string;
      email: string;
      phone: string;
      password: string;
      deviceId: string;
    }): Promise<RegisterResult>;

    verifyEmail(token: string): Promise<VerifyEmailResult>;

    /** Takes the staff ID, not the email - that is what the backend accepts. */
    resendVerification(staffId: string): Promise<PasswordResetRequestResult>;
  };

  password: {
    requestReset(email: string): Promise<PasswordResetRequestResult>;
    reset(input: { token: string; password: string }): Promise<ResetPasswordResult>;
    change(input: {
      currentPassword: string;
      newPassword: string;
    }): Promise<ChangePasswordResult>;
  };

  attendance: {
    /** Runs on /scan load. Never asks for location. */
    resolveToken(token: string): Promise<ScanResolution>;

    /** Runs only after the staff member taps the button and grants location. */
    submit(input: {
      token: string;
      deviceId: string;
      coordinates: Coordinates;
    }): Promise<AttendanceOutcome>;

    today(): Promise<TodayResult>;

    history(input: {
      period: HistoryPeriod;
      /** Only used when period is "custom". YYYY-MM-DD. */
      from?: string;
      to?: string;
    }): Promise<HistoryResult>;
  };
};
