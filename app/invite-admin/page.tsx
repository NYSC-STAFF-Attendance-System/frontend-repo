import { Suspense } from "react";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { InviteAdminView } from "./invite-admin-view";

/**
 * /invite-admin
 *
 * Public on purpose: the person following the email is not an admin yet.
 * The split with Suspense is the same as /verify-email: useSearchParams cannot
 * be read while this route is prerendered.
 */
export default function InviteAdminPage() {
  return (
    <Screen>
      <Suspense fallback={<LoadingState label="Loading" />}>
        <InviteAdminView />
      </Suspense>
    </Screen>
  );
}
