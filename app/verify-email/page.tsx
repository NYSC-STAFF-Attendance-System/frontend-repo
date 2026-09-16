import { Suspense } from "react";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { VerifyEmailView } from "./verify-email-view";

/**
 * /verify-email
 *
 * This file has no "use client" on purpose, and that is the whole point of the
 * split. useSearchParams cannot be read while a page is being prerendered, so
 * React has to be told where to pause. The Suspense boundary is that mark, and
 * it must sit ABOVE the component doing the reading - which means it cannot
 * live in the same file as the hook.
 *
 * Skip the boundary and `next dev` still works, because dev renders on demand.
 * `next build` then fails with a prerender error. Every route in this app that
 * reads a query parameter is split this way.
 */
export default function VerifyEmailPage() {
  return (
    <Screen>
      <Suspense fallback={<LoadingState label="Loading" />}>
        <VerifyEmailView />
      </Suspense>
    </Screen>
  );
}
