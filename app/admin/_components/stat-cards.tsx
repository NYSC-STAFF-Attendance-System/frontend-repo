import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  LogOut,
  TrendingUp,
  UserPlus,
  UserX,
} from "lucide-react"

import { cn } from "@/lib/utils"

const cards = [
  {
    label: "Total Staff",
    value: "254",
    hint: "Active registered",
    icon: UserPlus,
    iconClass: "bg-mint text-nysc-green",
    valueClass: "text-ink",
  },
  {
    label: "Present",
    value: "198",
    hint: (
      <span className="flex items-center gap-1 text-nysc-green">
        <TrendingUp className="size-3.5" /> 78% on-time
      </span>
    ),
    icon: CheckCircle2,
    iconClass: "bg-mint text-nysc-green",
    valueClass: "text-nysc-green",
  },
  {
    label: "Late Arrivals",
    value: "14",
    hint: "Past 08:15 cutoff",
    icon: Clock,
    iconClass: "bg-danger-wash text-danger-muted",
    valueClass: "text-danger-muted",
  },
  {
    label: "Absent",
    value: "18",
    hint: (
      <span>
        Unexcused: <span className="font-medium text-danger">11</span>
      </span>
    ),
    icon: UserX,
    iconClass: "bg-danger-soft text-danger",
    valueClass: "text-danger",
  },
  {
    label: "Checked Out",
    value: "142",
    hint: "Departure logs",
    icon: LogOut,
    iconClass: "bg-surface-50 text-slate",
    valueClass: "text-ink",
  },
  {
    label: "Approvals",
    value: "12",
    hint: (
      <span className="inline-flex items-center gap-1 font-medium text-nysc-green">
        Review requests
        <ArrowUpRight className="size-3.5" />
      </span>
    ),
    icon: BadgeCheck,
    iconClass: "bg-mint text-nysc-green",
    valueClass: "text-nysc-green",
  },
]

export function StatCards() {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <article
            key={card.label}
            className="rounded-2xl border border-line/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-olive-muted uppercase">
                {card.label}
              </p>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  card.iconClass
                )}
              >
                <Icon className="size-4" strokeWidth={1.85} />
              </span>
            </div>
            <p
              className={cn(
                "text-[32px] leading-none font-semibold tracking-tight",
                card.valueClass
              )}
            >
              {card.value}
            </p>
            <div className="mt-2 text-xs text-slate">{card.hint}</div>
          </article>
        )
      })}
    </section>
  )
}
