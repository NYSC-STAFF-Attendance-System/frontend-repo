"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { featuredAttendance } from "@/app/admin/attendance/_data";
import { featuredAuditEvents } from "@/app/admin/audit-log/_data";

export type SearchKind = "person" | "attendance" | "page" | "action" | "audit";
export type SearchIntent = "late" | "pending" | "qr" | "deficient";

export type SearchHit = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  haystack: string;
  badge?: string;
  initials?: string;
};

export const SEARCH_SPARKS = ["late", "pending", "QR poster", "Chinelo", "deficient"] as const;

export const INTENT_HINT: Record<SearchIntent, string> = {
  late: "Heard: late arrivals",
  pending: "Heard: pending approvals",
  qr: "Heard: office QR",
  deficient: "Heard: deficient stations",
};

const PAGES: SearchHit[] = [
  {
    id: "page-dashboard",
    kind: "page",
    title: "Dashboard",
    subtitle: "Today’s attendance pulse",
    href: "/admin",
    haystack: "dashboard home overview",
  },
  {
    id: "page-staff",
    kind: "page",
    title: "Staff approvals",
    subtitle: "Pending registrations and devices",
    href: "/admin/staff",
    haystack: "staff pending approval register face id",
  },
  {
    id: "page-attendance",
    kind: "page",
    title: "Attendance",
    subtitle: "Sign-ins, lateness, geofence",
    href: "/admin/attendance",
    haystack: "attendance late absent checkout gps",
  },
  {
    id: "page-reports",
    kind: "page",
    title: "Reports",
    subtitle: "Punctuality and deficient stations",
    href: "/admin/reports",
    haystack: "reports punctuality deficient csv export",
  },
  {
    id: "page-settings",
    kind: "page",
    title: "Settings",
    subtitle: "Hours, grace, and geofence radius",
    href: "/admin/settings",
    haystack: "settings hours grace geofence perimeter",
  },
  {
    id: "page-qr",
    kind: "page",
    title: "Office QR code",
    subtitle: "Print and kiosk the station poster",
    href: "/admin/settings/office-qr",
    haystack: "qr poster kiosk scan token regenerate",
  },
  {
    id: "page-audit",
    kind: "page",
    title: "Audit log",
    subtitle: "Overrides, approvals, device resets",
    href: "/admin/audit-log",
    haystack: "audit trail override device reset",
  },
];

const ACTIONS: SearchHit[] = [
  {
    id: "action-qr",
    kind: "action",
    title: "Generate office QR",
    subtitle: "Open the station poster",
    href: "/admin/settings/office-qr",
    haystack: "generate qr print poster kiosk",
    badge: "Action",
  },
  {
    id: "action-kiosk",
    kind: "action",
    title: "Lobby kiosk mode",
    subtitle: "Full-screen code for the reception desk",
    href: "/admin/settings/office-qr?view=kiosk",
    haystack: "kiosk lobby display fullscreen",
    badge: "Action",
  },
  {
    id: "action-export",
    kind: "action",
    title: "Export attendance report",
    subtitle: "Jump to reports and download CSV",
    href: "/admin/reports",
    haystack: "export csv report download",
    badge: "Action",
  },
  {
    id: "action-late",
    kind: "action",
    title: "Show late arrivals",
    subtitle: "Attendance filtered to late",
    href: "/admin/attendance?status=Late",
    haystack: "late arrivals cutoff tardy",
    badge: "Action",
  },
  {
    id: "action-pending",
    kind: "action",
    title: "Review pending staff",
    subtitle: "Open the approval queue",
    href: "/admin/staff",
    haystack: "pending approval review",
    badge: "Action",
  },
  {
    id: "action-deficient",
    kind: "action",
    title: "Deficient stations",
    subtitle: "Reports filtered to stations behind",
    href: "/admin/reports?status=Deficient&anomalies=1",
    haystack: "deficient anomalous stations behind",
    badge: "Action",
  },
];

const PLACEHOLDERS = [
  "Search the portal…",
  "Try “late today”",
  "Find a staff ID…",
  "Jump to QR poster",
  "Who is pending?",
];

const RECENT_KEY = "nysc.admin.search.recent";

function scoreHaystack(haystack: string, needle: string) {
  const hay = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (!n) return 0;
  const exact = hay.indexOf(n);
  if (exact >= 0) return 120 - exact + n.length * 4;
  // Short queries are intent chips ("late", "QR"). Fuzzy subsequence
  // matching turns those into noise across half the catalog.
  if (n.length <= 4) return 0;

  let cursor = 0;
  let consecutive = 0;
  let last = -2;
  for (const char of n) {
    const found = hay.indexOf(char, cursor);
    if (found < 0) return 0;
    consecutive += found === last + 1 ? 8 : 0;
    last = found;
    cursor = found + 1;
  }
  return 36 + consecutive - last * 0.2;
}

function matchIndexes(text: string, needle: string): number[] {
  const hay = text.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (!n) return [];
  const exact = hay.indexOf(n);
  if (exact >= 0) return Array.from({ length: n.length }, (_, i) => exact + i);
  const indexes: number[] = [];
  let cursor = 0;
  for (const char of n) {
    const found = hay.indexOf(char, cursor);
    if (found < 0) return [];
    indexes.push(found);
    cursor = found + 1;
  }
  return indexes;
}

function readIntent(needle: string): SearchIntent | null {
  if (/\b(late|tardy)\b/i.test(needle)) return "late";
  if (/\b(pending|approv)/i.test(needle)) return "pending";
  if (/\b(qr|poster|kiosk|scan)\b/i.test(needle)) return "qr";
  if (/\b(deficient|anomal)/i.test(needle)) return "deficient";
  return null;
}

type Recent = { title: string; href: string; kind: SearchKind };

function readRecents(): Recent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as Recent[]) : [];
  } catch {
    return [];
  }
}

function writeRecents(items: Recent[]) {
  try {
    window.sessionStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 5)));
  } catch {
    // Private browsing can block this; recents just won't persist.
  }
}

export function useAdminSearch() {
  const router = useRouter();
  const pending = useAppSelector((state) => state.staffApprovals.queue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState(PLACEHOLDERS[0]);
  const [recents, setRecents] = useState<Recent[]>([]);
  const [modKey, setModKey] = useState("⌘");

  useEffect(() => {
    setRecents(readRecents());
    setModKey(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl");
  }, []);

  useEffect(() => {
    if (open) return;
    const id = window.setInterval(() => {
      setPlaceholderIndex((value) => (value + 1) % PLACEHOLDERS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (open) return;
    const full = PLACEHOLDERS[placeholderIndex];
    setTypedPlaceholder("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTypedPlaceholder(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 36);
    return () => window.clearInterval(id);
  }, [open, placeholderIndex]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setOpen((isOpen) => {
        if (isOpen) {
          setQuery("");
          setActive(0);
          return false;
        }
        return true;
      });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const catalog = useMemo<SearchHit[]>(() => {
    const people: SearchHit[] = pending.map((staff) => ({
      id: `person-${staff.id}`,
      kind: "person",
      title: staff.name,
      subtitle: `${staff.staffId} · ${staff.department}`,
      href: `/admin/staff?q=${encodeURIComponent(staff.name)}`,
      haystack: `${staff.name} ${staff.staffId} ${staff.department} ${staff.office} pending approval`,
      badge: "Pending",
      initials: staff.initials,
    }));

    const attendance: SearchHit[] = featuredAttendance.map((row) => ({
      id: `att-${row.id}`,
      kind: "attendance",
      title: row.name,
      subtitle: `${row.staffId} · ${row.checkIn ?? "—"} · ${row.location}`,
      href: `/admin/attendance/${row.id}`,
      haystack: `${row.name} ${row.staffId} ${row.status} ${row.location} ${row.department} attendance`,
      badge: row.status.replace("-", " "),
      initials: row.initials,
    }));

    const audit: SearchHit[] = featuredAuditEvents.map((event) => ({
      id: `audit-${event.id}`,
      kind: "audit",
      title: event.action,
      subtitle: `${event.user} · ${event.recordDetail}`,
      href: `/admin/audit-log?event=${event.id}&q=${encodeURIComponent(event.user)}`,
      haystack: `${event.action} ${event.user} ${event.recordCode} ${event.recordDetail} ${event.module}`,
      badge: event.module,
      initials: event.initials,
    }));

    return [...people, ...attendance, ...PAGES, ...ACTIONS, ...audit];
  }, [pending]);

  const intent = useMemo(() => readIntent(query), [query]);

  const results = useMemo(() => {
    const needle = query.trim();
    if (!needle) return [];

    const ranked = catalog
      .map((hit) => {
        let points = scoreHaystack(`${hit.title} ${hit.subtitle} ${hit.haystack}`, needle);
        if (!points) return null;
        if (intent === "late" && (hit.badge === "late" || hit.href.includes("status=Late"))) points += 40;
        if (intent === "pending" && (hit.badge === "Pending" || hit.href === "/admin/staff")) points += 40;
        if (intent === "qr" && hit.href.includes("office-qr")) points += 50;
        if (intent === "deficient" && hit.href.includes("reports")) points += 40;
        return { hit, points, marks: matchIndexes(hit.title, needle) };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => b.points - a.points);

    const best = ranked[0]?.points ?? 0;
    return ranked.filter((row) => row.points >= best * 0.55).slice(0, 8);
  }, [catalog, intent, query]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  const go = useCallback(
    (hit: Pick<SearchHit, "title" | "href" | "kind">) => {
      setRecents((current) => {
        const next = [
          { title: hit.title, href: hit.href, kind: hit.kind },
          ...current.filter((item) => item.href !== hit.href),
        ].slice(0, 5);
        writeRecents(next);
        return next;
      });
      router.push(hit.href);
      close();
    },
    [close, router],
  );

  function onInputKey(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(Math.max(results.length - 1, 0), value + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(0, value - 1));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active].hit);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  return {
    open,
    setOpen,
    query,
    setQuery,
    active,
    setActive,
    results,
    recents,
    placeholder: typedPlaceholder,
    intent,
    intentHint: intent ? INTENT_HINT[intent] : null,
    modKey,
    onInputKey,
    go,
    close,
    spark: (value: string) => {
      setOpen(true);
      setQuery(value);
    },
  };
}
