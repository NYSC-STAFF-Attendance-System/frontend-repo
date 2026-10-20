import { Suspense } from "react";
import { BrandLockup } from "@/components/brand";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { BlockedView } from "./blocked-view";

/** Same Suspense split as the other routes that read a query parameter. */
export default function BlockedPage() {
  return (
    <Screen className="justify-center">
      <BrandLockup className="mb-10" />
      <Suspense fallback={<LoadingState label="Loading" />}>
        <BlockedView />
      </Suspense>
    </Screen>
  );
}
