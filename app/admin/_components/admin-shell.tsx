"use client";

import { useState } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-page">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto sm:gap-8 lg:gap-12 print:gap-0">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 px-3 pb-6 sm:px-4 sm:pb-8 lg:px-8 print:px-0 print:pb-0">{children}</main>
      </div>
    </div>
  );
}
