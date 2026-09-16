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
 * AuthGuard sits above Suspense because it does not read the URL. ScanView does,
 * so the boundary has to be between the two.
 */
export default function ScanPage() {
  return (
    <AuthGuard>
      <Screen>
        <Suspense fallback={<LoadingState label="Loading" />}>
          <ScanView />
        </Suspense>
      </Screen>
    </AuthGuard>
  );
}
