"use client";

import { useState } from "react";
import { useStaff } from "@/hooks/use-staff";
import { api } from "@/lib/api";
import type { InviteAdminResult } from "@/types";

export function useInviteAdmin() {
  const staff = useStaff();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<InviteAdminResult | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!value) return;
    setSubmitting(true);
    setResult(await api.admin.inviteAdmin(value));
    setSubmitting(false);
  }

  return {
    isSuperAdmin: staff.role === "super_admin",
    email,
    setEmail,
    submitting,
    result,
    submit,
  };
}
