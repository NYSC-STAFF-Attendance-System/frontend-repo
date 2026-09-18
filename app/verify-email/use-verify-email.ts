"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { VerifyEmailResult } from "@/types";

export type VerifyEmailState =
  | { name: "awaiting_link" }
  | { name: "verifying" }
  | { name: "result"; result: VerifyEmailResult };

export function useVerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [state, setState] = useState<VerifyEmailState>(
    token ? { name: "verifying" } : { name: "awaiting_link" },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;

    api.registration.verifyEmail(token).then((result) => {
      if (!active) return;
      setState({ name: "result", result });
    });

    return () => {
      active = false;
    };
  }, [token]);

  return { email, state };
}

export function useResendVerification(email: string | null) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function resend() {
    if (!email) return;
    setResending(true);
    await api.registration.resendVerification(email);
    setResending(false);
    setResent(true);
  }

  return { resending, resent, resend };
}
