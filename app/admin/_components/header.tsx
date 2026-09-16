"use client";

import { Bell, CircleHelp, Menu, Search } from "lucide-react";

export function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 bg-nysc-soft/90 px-4 backdrop-blur-sm lg:h-[72px] lg:px-8 border-b border-[#BDCABE]">
      <button
        type="button"
        className="rounded-lg p-2 text-zinc-500 hover:bg-white lg:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
        <label className="relative hidden min-w-[220px] sm:block md:min-w-[280px]">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Search staff..."
            className="h-10 w-full rounded-full border-0 bg-white pr-4 pl-10 text-sm text-zinc-800 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-zinc-200/80 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-nysc/25"
          />
        </label>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200/80 hover:text-zinc-800"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200/80 hover:text-zinc-800"
          aria-label="Help"
        >
          <CircleHelp className="size-4" />
        </button>
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=96&h=96"
          alt="Admin profile"
          className="size-10 rounded-full object-cover ring-2 ring-white"
        />
      </div>
    </header>
  );
}
