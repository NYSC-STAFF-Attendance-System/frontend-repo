/**
 * Device binding.
 *
 * One phone per staff member. A device id is generated once, on the phone, at
 * registration, and then sent with every login and every attendance call. Staff
 * cannot change it; only an admin can reset the binding after verifying who
 * they are talking to.
 *
 * This is not a security boundary on its own - localStorage can be cleared, and
 * clearing it is exactly what a lost phone looks like from here. The backend is
 * what refuses the mismatch. This module's only job is to produce a stable value
 * and hand it over.
 */

const STORAGE_KEY = "nysc.device_id";

/**
 * Reads the stored device id, creating one on first use.
 *
 * Returns null during server rendering, where there is no localStorage. Callers
 * are client components that run this in an effect or an event handler, so a
 * null here means "too early", never "no device".
 */
export function getDeviceId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const created = createDeviceId();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    // Private browsing and blocked site data both throw here. Returning null
    // lets the caller show "we could not identify this device" rather than
    // crashing the page.
    return null;
  }
}

/** True once a device id exists, without creating one as a side effect. */
export function hasDeviceId(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Wipes the binding. Only for the prototype's own dev tooling and for logout on
 * a shared demo phone - staff have no route to this in the real product.
 */
export function clearDeviceId(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; the value was unreachable anyway.
  }
}

function createDeviceId(): string {
  // randomUUID needs a secure context, which localhost and https both are. The
  // fallback covers older mobile browsers on plain http during testing.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
