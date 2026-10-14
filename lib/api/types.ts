import type {
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
    /** Super admin only. Sends an invite link to an existing staff email. */
    inviteAdmin(email: string): Promise<InviteAdminResult>;

    /** Public. Following the invite email upgrades that staff to admin. */
    verifyAdminInvite(token: string): Promise<VerifyAdminInviteResult>;

    /** The printed station QR staff scan to open /scan. */
    getOfficeQr(): Promise<OfficeQrResult>;
    setOfficeQrAccepting(accepting: boolean): Promise<OfficeQrResult>;
    regenerateOfficeQr(): Promise<OfficeQrResult>;
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
    resendVerification(email: string): Promise<PasswordResetRequestResult>;
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
