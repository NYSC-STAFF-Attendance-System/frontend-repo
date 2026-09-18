"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Logs,
  QrCode,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  SEARCH_SPARKS,
  useAdminSearch,
  type SearchHit,
  type SearchKind,
} from "../_hooks/use-admin-search";

function highlight(text: string, marks: number[]) {
  if (marks.length === 0) return text;
  const set = new Set(marks);
  const parts: ReactNode[] = [];
  let buffer = "";
  let marked = set.has(0);

  const flush = (isMark: boolean, key: number) => {
    if (!buffer) return;
    parts.push(
      isMark ? (
        <mark key={key} className="rounded-[3px] bg-mint px-px text-nysc-dark">
          {buffer}
        </mark>
      ) : (
        <span key={key}>{buffer}</span>
      ),
    );
    buffer = "";
  };

  for (let index = 0; index < text.length; index++) {
    const isMark = set.has(index);
    if (index > 0 && isMark !== marked) {
      flush(marked, index);
      marked = isMark;
    }
    buffer += text[index];
  }
  flush(marked, text.length);
  return parts;
}

const kindIcon: Record<SearchKind, typeof Search> = {
  person: UserRound,
  attendance: ClipboardList,
  page: LayoutDashboard,
  action: Zap,
  audit: Logs,
};

const kindLabel: Record<SearchKind, string> = {
  person: "People",
  attendance: "Attendance",
  page: "Jump to",
  action: "Do this",
  audit: "Audit",
};

export function HeaderSearch() {
  const search = useAdminSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Popover
      open={search.open}
      onOpenChange={(next) => {
        search.setOpen(next);
        if (!next) search.close();
      }}
    >
      <PopoverTrigger
        aria-label="Search the portal"
        className="group relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-white text-left text-zinc-500 ring-1 ring-zinc-200/80 transition-[min-width,box-shadow,background-color] hover:text-zinc-800 data-popup-open:bg-nysc-muted data-popup-open:text-nysc data-popup-open:ring-nysc/25 sm:h-10 sm:w-auto sm:min-w-57 sm:justify-start sm:gap-2.5 sm:bg-nysc-soft/90 sm:pr-3 sm:pl-3.5 sm:text-zinc-400 sm:hover:ring-nysc/25 sm:data-popup-open:min-w-73 sm:data-popup-open:bg-white sm:data-popup-open:shadow-[0_8px_24px_rgba(24,140,68,0.10)] md:min-w-70"
      >
        <span className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-linear-to-r from-transparent via-nysc/25 to-transparent sm:block motion-safe:animate-search-scan" />
        <span className="relative flex size-5 shrink-0 items-center justify-center">
          <Search className="size-4 text-nysc" />
          <span
            className="absolute inset-1.25 rounded-full border border-transparent border-t-nysc/50 border-r-nysc/15 motion-safe:animate-spin"
            style={{ animationDuration: search.open ? "1.1s" : "2.8s" }}
          />
        </span>
        <span className="relative hidden min-w-0 flex-1 truncate text-sm sm:block">
          {search.placeholder}
          <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 bg-nysc align-middle motion-safe:animate-caret" />
        </span>
        <kbd className="relative hidden rounded-md bg-white/80 px-1.5 py-0.5 font-sans text-[10px] font-semibold tracking-wide text-olive-muted ring-1 ring-zinc-200/80 md:inline-block">
          {search.modKey}K
        </kbd>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(calc(100vw-1.5rem),460px)] overflow-hidden p-0"
        initialFocus={inputRef}
      >
        <SearchPanel search={search} inputRef={inputRef} />
      </PopoverContent>
    </Popover>
  );
}

function SearchPanel({
  search,
  inputRef,
}: {
  search: ReturnType<typeof useAdminSearch>;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const empty = search.query.trim().length === 0;
  const activeHit = search.results[search.active]?.hit;

  return (
    <div className="flex flex-col">
      <div className="h-0.5 bg-linear-to-r from-nysc via-mint to-nysc-dark" />
      <div className="flex items-center gap-2.5 border-b border-line/70 px-3.5 py-3">
        <Search className="size-4 shrink-0 text-nysc" />
        <input
          ref={inputRef}
          value={search.query}
          onChange={(event) => search.setQuery(event.target.value)}
          onKeyDown={search.onInputKey}
          placeholder="People, attendance, pages, actions…"
          className="h-7 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-zinc-400"
          aria-label="Search the portal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {search.query ? (
          <button
            type="button"
            onClick={() => search.setQuery("")}
            className="text-[11px] font-semibold text-olive-muted hover:text-ink"
          >
            Clear
          </button>
        ) : (
          <span className="text-[11px] font-medium text-zinc-400">Esc</span>
        )}
      </div>

      {search.intentHint ? (
        <p className="flex items-center gap-1.5 border-b border-line/50 bg-nysc-soft px-3.5 py-2 text-[11px] font-semibold tracking-wide text-nysc">
          <Sparkles className="size-3" />
          {search.intentHint}
        </p>
      ) : null}

      {empty ? (
        <IdlePanel search={search} />
      ) : search.results.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-olive-muted">
          Nothing matches “{search.query}”. Try a name, staff ID, or{" "}
          <button
            type="button"
            className="font-semibold text-nysc"
            onClick={() => search.spark("QR poster")}
          >
            QR poster
          </button>
          .
        </p>
      ) : (
        <ul className="max-h-95 overflow-y-auto py-1.5" role="listbox">
          {search.results.map((row, index) => {
            const prevKind = search.results[index - 1]?.hit.kind;
            const showKind = row.hit.kind !== prevKind;
            return (
              <li key={row.hit.id}>
                {showKind ? (
                  <p className="px-3.5 pt-2 pb-1 text-[10px] font-semibold tracking-[0.14em] text-olive-muted uppercase">
                    {kindLabel[row.hit.kind]}
                  </p>
                ) : null}
                <ResultRow
                  hit={row.hit}
                  marks={row.marks}
                  active={index === search.active}
                  onHover={() => search.setActive(index)}
                  onPick={() => search.go(row.hit)}
                />
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-line/70 px-3.5 py-2.5 text-[11px] text-olive-muted">
        <span className="flex items-center gap-2">
          <Hint keys="↑↓" label="move" />
          <Hint keys="↵" label="open" />
          <Hint keys="esc" label="close" />
        </span>
        {activeHit ? (
          <span className="min-w-0 truncate font-medium text-nysc">
            {activeHit.title}
          </span>
        ) : (
          <span>
            {search.results.length
              ? `${search.results.length} matches`
              : `${search.modKey}K anytime`}
          </span>
        )}
      </div>
    </div>
  );
}

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <kbd className="rounded bg-surface-50 px-1 py-px font-sans text-[10px] font-semibold text-ink ring-1 ring-zinc-200/80">
        {keys}
      </kbd>
      {label}
    </span>
  );
}

function IdlePanel({ search }: { search: ReturnType<typeof useAdminSearch> }) {
  return (
    <div className="px-3.5 py-3">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-olive-muted uppercase">
        <Sparkles className="size-3 text-nysc" />
        Try saying
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SEARCH_SPARKS.map((spark) => (
          <button
            key={spark}
            type="button"
            onClick={() => search.spark(spark)}
            className="rounded-full bg-nysc-soft px-2.5 py-1 text-xs font-medium text-nysc ring-1 ring-nysc/15 transition-colors hover:bg-mint"
          >
            {spark}
          </button>
        ))}
      </div>

      {search.recents.length > 0 ? (
        <div className="mt-4">
          <p className="mb-1.5 text-[10px] font-semibold tracking-[0.14em] text-olive-muted uppercase">
            Recent
          </p>
          <ul>
            {search.recents.map((item) => {
              const Icon = kindIcon[item.kind];
              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => search.go(item)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-surface-50"
                  >
                    <Icon className="size-3.5 text-olive-muted" />
                    <span className="text-sm text-ink">{item.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-1.5">
          <IdleJump
            href="/admin/settings/office-qr"
            icon={QrCode}
            label="Office QR"
            onPick={search.go}
          />
          <IdleJump
            href="/admin/reports"
            icon={FileText}
            label="Reports"
            onPick={search.go}
          />
          <IdleJump
            href="/admin/settings"
            icon={Settings}
            label="Settings"
            onPick={search.go}
          />
          <IdleJump
            href="/admin/audit-log"
            icon={Logs}
            label="Audit log"
            onPick={search.go}
          />
        </div>
      )}
    </div>
  );
}

function IdleJump({
  href,
  icon: Icon,
  label,
  onPick,
}: {
  href: string;
  icon: typeof QrCode;
  label: string;
  onPick: (hit: Pick<SearchHit, "title" | "href" | "kind">) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick({ title: label, href, kind: "page" })}
      className="flex items-center gap-2 rounded-xl bg-surface-50 px-2.5 py-2 text-left text-xs font-semibold text-ink hover:bg-nysc-muted"
    >
      <Icon className="size-3.5 text-nysc" />
      {label}
    </button>
  );
}

function ResultRow({
  hit,
  marks,
  active,
  onHover,
  onPick,
}: {
  hit: SearchHit;
  marks: number[];
  active: boolean;
  onHover: () => void;
  onPick: () => void;
}) {
  const Icon = kindIcon[hit.kind];
  const late = hit.badge === "late";
  const pending = hit.badge === "Pending";

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onMouseEnter={onHover}
      onClick={onPick}
      className={cn(
        "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
        active ? "bg-nysc-soft" : "hover:bg-surface-50",
      )}
    >
      {hit.initials ? (
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
            pending || late
              ? "bg-danger-soft text-danger"
              : "bg-nysc-muted text-nysc",
          )}
        >
          {hit.initials}
        </span>
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-nysc-muted text-nysc">
          <Icon className="size-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">
            {highlight(hit.title, marks)}
          </span>
          {hit.badge ? (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                pending || late
                  ? "bg-danger-soft text-danger"
                  : "bg-surface-50 text-olive-muted",
              )}
            >
              {hit.badge}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-xs text-olive-muted">
          {hit.subtitle}
        </span>
      </span>
    </button>
  );
}
