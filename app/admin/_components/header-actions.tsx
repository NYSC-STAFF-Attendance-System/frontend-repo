"use client"

import {
  Bell,
  BookOpen,
  CircleHelp,
  LogOut,
  QrCode,
  Settings,
  Shield,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  initialsFor,
  roleLabel,
  useAdminHeader,
  type HeaderNotice,
} from "../_hooks/use-admin-header"

const iconButtonClass =
  "relative flex size-10 items-center justify-center rounded-full bg-white text-zinc-500 ring-1 ring-zinc-200/80 transition-colors hover:text-zinc-800 data-popup-open:bg-nysc-muted data-popup-open:text-nysc data-popup-open:ring-nysc/20"

export function HeaderActions() {
  const header = useAdminHeader()

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 lg:gap-3">
      <NotificationsMenu {...header} />
      <HelpMenu go={header.go} />
      <AccountMenu {...header} />
    </div>
  )
}

function NotificationsMenu({
  notices,
  unreadCount,
  isUnread,
  markRead,
  markAllRead,
  go,
}: ReturnType<typeof useAdminHeader>) {
  return (
    <Popover>
      <PopoverTrigger className={iconButtonClass} aria-label="Notifications">
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent className="flex w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b border-line/70 px-4 py-3.5">
          <div>
            <PopoverTitle>Notifications</PopoverTitle>
            <PopoverDescription className="mt-0.5 text-xs">
              {unreadCount > 0
                ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                : "You’re caught up"}
            </PopoverDescription>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-semibold text-nysc hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <ul className="max-h-90 overflow-y-auto py-1">
          {notices.map((notice) => (
            <li key={notice.id}>
              <PopoverClose
                className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-50"
                onClick={() => {
                  markRead(notice.id)
                  go(notice.href)
                }}
              >
                <NoticeRow notice={notice} unread={isUnread(notice.id)} />
              </PopoverClose>
            </li>
          ))}
        </ul>
        <div className="border-t border-line/70 px-4 py-3">
          <PopoverClose
            className="text-sm font-semibold text-nysc hover:underline"
            onClick={() => go("/admin/audit-log")}
          >
            View audit trail
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NoticeRow({ notice, unread }: { notice: HeaderNotice; unread: boolean }) {
  const tone =
    notice.tone === "warn"
      ? "bg-danger-soft text-danger"
      : notice.tone === "ok"
        ? "bg-mint text-nysc-dark"
        : "bg-nysc-muted text-nysc"

  return (
    <>
      <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", tone)}>
        <span className={cn("size-1.5 rounded-full", unread ? "bg-current" : "bg-current/40")} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={cn("text-sm", unread ? "font-semibold text-ink" : "font-medium text-ink")}>
            {notice.title}
          </span>
          <span className="shrink-0 text-[11px] text-olive-muted">{notice.time}</span>
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-olive-muted">{notice.detail}</span>
      </span>
    </>
  )
}

function HelpMenu({ go }: { go: (href: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger className={cn(iconButtonClass, "hidden sm:flex")} aria-label="Help">
        <CircleHelp className="size-4" />
      </PopoverTrigger>
      <PopoverContent className="w-[min(calc(100vw-2rem),340px)] overflow-hidden">
        <div className="border-b border-line/70 px-4 py-3.5">
          <PopoverTitle>Help & guides</PopoverTitle>
          <PopoverDescription className="mt-0.5 text-xs">
            How this portal records attendance
          </PopoverDescription>
        </div>
        <div className="flex flex-col gap-1 p-2">
          <HelpLink
            href="/admin/settings/office-qr"
            icon={QrCode}
            title="Office QR poster"
            hint="Print the station code staff scan on arrival."
            go={go}
          />
          <HelpLink
            href="/admin/settings"
            icon={Shield}
            title="Geofence & hours"
            hint="Resumption time, grace, and perimeter radius."
            go={go}
          />
          <HelpLink
            href="/admin/audit-log"
            icon={BookOpen}
            title="Audit trail"
            hint="Every override and device reset is logged here."
            go={go}
          />
        </div>
        <p className="border-t border-line/70 px-4 py-3 text-xs leading-5 text-olive-muted">
          Staff scan the printed office QR on their registered phone. Identity
          comes from the account, not from the poster.
        </p>
      </PopoverContent>
    </Popover>
  )
}

function HelpLink({
  href,
  icon: Icon,
  title,
  hint,
  go,
}: {
  href: string
  icon: typeof QrCode
  title: string
  hint: string
  go: (href: string) => void
}) {
  return (
    <PopoverClose
      className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-surface-50"
      onClick={() => go(href)}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-nysc-muted text-nysc">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-olive-muted">{hint}</span>
      </span>
    </PopoverClose>
  )
}

function AccountMenu({
  staff,
  signingOut,
  handleSignOut,
  go,
}: ReturnType<typeof useAdminHeader>) {
  const initials = initialsFor(staff.fullName)

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Account menu"
        className="flex size-10 items-center justify-center rounded-full bg-nysc text-[12px] font-bold text-white ring-2 ring-white transition-shadow data-popup-open:ring-nysc/30"
      >
        {initials}
      </PopoverTrigger>
      <PopoverContent className="w-[min(calc(100vw-2rem),280px)] overflow-hidden">
        <div className="border-b border-line/70 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-nysc text-sm font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <PopoverTitle className="truncate text-sm">{staff.fullName}</PopoverTitle>
              <PopoverDescription className="truncate text-xs">{staff.email}</PopoverDescription>
              <span className="mt-1 inline-flex rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold tracking-wide text-nysc-dark uppercase">
                {roleLabel(staff.role)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col p-2">
          <PopoverClose
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium text-ink hover:bg-surface-50"
            onClick={() => go("/admin/settings")}
          >
            <Settings className="size-4 text-olive-muted" />
            Settings
          </PopoverClose>
          <PopoverClose
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium text-ink hover:bg-surface-50"
            onClick={() => go("/admin/settings/office-qr")}
          >
            <QrCode className="size-4 text-olive-muted" />
            Office QR
          </PopoverClose>
        </div>
        <div className="border-t border-line/70 p-2">
          <Button
            type="button"
            variant="ghost"
            disabled={signingOut}
            onClick={() => void handleSignOut()}
            className="h-10 w-full justify-start rounded-xl text-danger hover:bg-danger-soft hover:text-danger"
          >
            <LogOut data-icon="inline-start" className="size-4" />
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
