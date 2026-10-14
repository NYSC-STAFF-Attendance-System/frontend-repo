"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VerifyAdminInviteResult } from "@/types";

export type InviteAdminState =
  | { name: "missing" }
  | { name: "verifying" }
  | { name: "result"; result: VerifyAdminInviteResult };

export function useVerifyAdminInvite() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<InviteAdminState>(
    token ? { name: "verifying" } : { name: "missing" },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;

    api.admin.verifyAdminInvite(token).then((result) => {
      if (!active) return;
      setState({ name: "result", result });
    });

    return () => {
      active = false;
    };
  }, [token]);

  return state;
}
