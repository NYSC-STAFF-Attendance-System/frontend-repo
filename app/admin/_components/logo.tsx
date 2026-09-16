import { cn } from "@/lib/utils"

export function NyscLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        className="size-9 shrink-0"
        aria-hidden="true"
      >
        <path
          d="M11.2 5.2h17.6c1.7 0 3.2.9 4.1 2.3l5.5 9.5c.8 1.4.8 3.2 0 4.6l-5.5 9.5c-.9 1.4-2.4 2.3-4.1 2.3H11.2c-1.7 0-3.2-.9-4.1-2.3l-5.5-9.5c-.8-1.4-.8-3.2 0-4.6l5.5-9.5c.9-1.4 2.4-2.3 4.1-2.3Z"
          fill="#148a47"
        />
        <path
          d="M20 11.2c-2.3 0-4.1 1.8-4.1 4.1 0 2.2 1.8 4 4.1 4s4.1-1.8 4.1-4-1.8-4.1-4.1-4.1Zm0 9.6c-3.4 0-6.4 1.8-8 4.5-.3.6.1 1.3.7 1.3h14.6c.6 0 1-.7.7-1.3-1.6-2.7-4.6-4.5-8-4.5Z"
          fill="white"
        />
      </svg>
      <div className="min-w-0 leading-tight">
        <p className="text-[15px] font-semibold tracking-tight text-zinc-900">
          NYSC Portal
        </p>
        <p className="text-[11px] font-medium text-zinc-400">Staff Management</p>
      </div>
    </div>
  )
}
