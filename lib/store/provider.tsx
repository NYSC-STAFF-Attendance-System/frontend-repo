"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { onAdminSessionEnded } from "@/lib/api/admin-session";
import { hydrateAuth, sessionEnded } from "./slices/auth-slice";
import { store } from "./store";

if (typeof window !== "undefined") {
  onAdminSessionEnded(() => {
    store.dispatch(sessionEnded());
  });
}

function AuthHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void store.dispatch(hydrateAuth());
  }, []);

  return children;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}
