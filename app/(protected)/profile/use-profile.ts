"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStaff } from "@/hooks/use-staff";
import { useAppDispatch } from "@/lib/store/hooks";
import { signOut } from "@/lib/store/slices/auth-slice";

export function useProfile() {
  const staff = useStaff();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await dispatch(signOut());
    router.replace("/login");
  }

  return { staff, signingOut, handleSignOut };
}
