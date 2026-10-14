import { Suspense } from "react";
import { Screen } from "@/components/screen";
import { LoadingState } from "@/components/states";
import { LoginView } from "./login-view";

export default function LoginPage() {
  return (
    <Screen>
      <Suspense fallback={<LoadingState label="Loading" />}>
        <LoginView />
      </Suspense>
    </Screen>
  );
}
