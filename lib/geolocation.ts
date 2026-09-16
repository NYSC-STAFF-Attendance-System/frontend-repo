import type { Coordinates, LocationFailure } from "@/types";

export type PositionResult =
  | { ok: true; coordinates: Coordinates }
  | { ok: false; failure: LocationFailure };

/**
 * Asks the browser for the phone's current position.
 *
 * Called only from a tap handler on /scan, never on page load. The permission
 * prompt a browser shows is tied to that gesture, and asking without one trains
 * people to deny it - after which the only fix is buried in browser settings.
 *
 * Wrapped in a promise because the native API is callback-based and predates
 * async/await, and mapped onto LocationFailure so a refusal is a value the
 * screen must handle rather than an exception it might forget to catch.
 */
export function requestPosition(): Promise<PositionResult> {
  return new Promise((resolve) => {
    // Missing on http origins other than localhost, and in a few locked-down
    // browsers. Treated as unavailable rather than crashing the screen.
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ok: false, failure: { kind: "unavailable" } });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          ok: true,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      (error) => {
        resolve({ ok: false, failure: { kind: failureKind(error) } });
      },
      {
        // The whole product rests on the person actually being at the office,
        // so a coarse network-derived fix is not good enough.
        enableHighAccuracy: true,
        // 15s is long on a desk and short under a concrete roof. Below this,
        // staff indoors get a timeout they cannot do anything about.
        timeout: 15000,
        // No cached position, at any age. A fix from when they were at home
        // this morning would place them at home now.
        maximumAge: 0,
      },
    );
  });
}

function failureKind(error: GeolocationPositionError): LocationFailure["kind"] {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "permission_denied";
    case error.TIMEOUT:
      return "timed_out";
    default:
      return "unavailable";
  }
}
