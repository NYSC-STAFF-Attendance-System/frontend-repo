import { Suspense } from "react";
import { BrandLockup } from "@/components/brand";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { ResetPasswordView } from "./reset-password-view";

/**
 * /reset-password
 *
 * Same split as /verify-email: this file stays a server component so the
 * Suspense boundary sits above the component that reads the token from the URL.
 */
export default function ResetPasswordPage() {
  return (
    <Screen>
      <BrandLockup align="start" className="mb-8" />
      <Suspense fallback={<LoadingState label="Loading" />}>
        <ResetPasswordView />
      </Suspense>
    </Screen>
  );
}
