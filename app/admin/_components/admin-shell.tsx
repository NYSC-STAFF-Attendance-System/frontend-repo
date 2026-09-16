"use client";

import { useState } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-nysc-soft">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto gap-12">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 pb-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
