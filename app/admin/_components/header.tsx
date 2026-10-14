"use client"

import { Menu } from "lucide-react"

import { Breadcrumbs } from "./breadcrumbs"
import { HeaderActions } from "./header-actions"
import { HeaderSearch } from "./header-search"

export function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-page px-3 backdrop-blur-sm print:hidden sm:h-16 sm:gap-3 sm:px-4 lg:h-18 lg:gap-4 lg:px-8">
      <button
        type="button"
        className="-ml-1 rounded-lg p-2 text-zinc-500 hover:bg-white lg:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <Breadcrumbs />

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5 lg:gap-3">
        <HeaderSearch />
        <HeaderActions />
      </div>
    </header>
  )
}
