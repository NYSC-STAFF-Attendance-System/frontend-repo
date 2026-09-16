import { Suspense } from "react";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { BlockedView } from "./blocked-view";

/** Same Suspense split as the other routes that read a query parameter. */
export default function BlockedPage() {
  return (
    <Screen className="justify-center">
      <Suspense fallback={<LoadingState label="Loading" />}>
        <BlockedView />
      </Suspense>
    </Screen>
  );
}
