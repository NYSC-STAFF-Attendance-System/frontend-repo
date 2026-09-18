import { Suspense } from "react";
import { AppBar } from "@/components/app-bar";
import { AuthGuard } from "@/components/auth-provider";
import { BottomNav } from "@/components/bottom-nav";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";

/**
 * Layout for the signed-in screens: /home, /history, /profile.
 *
 * The folder is named (protected) with brackets, which makes it a route group -
 * it organises files without appearing in the URL. /home stays /home.
 *
 * /scan is deliberately NOT in this group. It gets the same auth guard but
 * neither bar, because the sign in button there has to be reachable without
 * scrolling and the two would take 108 pixels of the fold between them.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <Screen>
          <LoadingState label="Checking your account" />
        </Screen>
      }
    >
      <AuthGuard>
        <AppBar />
        {/* pb-20 keeps content clear of the fixed bar at the bottom. */}
        <div className="flex flex-1 flex-col pb-20">{children}</div>
        <BottomNav />
      </AuthGuard>
    </Suspense>
  );
}
