"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type FilterOption = {
  value: string
  label: string
}

function toItems(options: Array<string | FilterOption>): FilterOption[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  )
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<string | FilterOption>
  placeholder?: string
  className?: string
  "aria-label"?: string
}) {
  const items = toItems(options)

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next)
      }}
      items={items}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "h-10 w-full min-w-0 rounded-full border-zinc-200 bg-white px-3 text-sm text-zinc-600 shadow-none *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false} side="bottom">
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
