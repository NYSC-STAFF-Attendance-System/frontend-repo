import { Suspense } from "react";
import { AuthGuard } from "@/components/auth-provider";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { ScanView } from "./scan-view";

/**
 * /scan
 *
 * Outside the (protected) route group on purpose: it gets the same AuthGuard,
 * but no bottom navigation. The sign in button has to sit within the fold at
 * 375px, and a fixed bar would take 56 pixels of it.
 *
 * AuthGuard also reads the URL (to send a login redirect), so both it and
 * ScanView sit inside Suspense.
 */
export default function ScanPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading" />}>
      <AuthGuard>
        <Screen>
          <ScanView />
        </Screen>
      </AuthGuard>
    </Suspense>
  );
}
