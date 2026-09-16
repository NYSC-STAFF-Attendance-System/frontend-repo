"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * A bar that appears while the browser reports no connection.
 *
 * Shown app-wide rather than per screen, because losing signal matters most at
 * the moment a staff member is standing at the office about to sign in, and
 * that is the one screen where an inline message would push the button below
 * the fold.
 *
 * navigator.onLine is a weak signal - a phone joined to office wifi with no
 * route to the internet still reports online - so this is a hint, not a
 * guarantee. The real detection is a request failing, which each screen already
 * handles through its own offline branch. This bar exists to explain a failure
 * the person can see coming.
 */
export function OfflineBanner() {
  // Starts online so the server-rendered markup and the first client render
  // agree. Anything else causes a hydration mismatch.
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-20 flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-sm font-medium text-white"
      style={{ paddingTop: "calc(0.5rem + env(safe-area-inset-top, 0px))" }}
    >
      <WifiOff aria-hidden="true" className="size-4" />
      No connection. Attendance cannot be recorded.
    </div>
  );
}
