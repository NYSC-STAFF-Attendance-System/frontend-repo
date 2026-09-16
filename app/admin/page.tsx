import { QuickActions } from "./_components/quick-actions"
import { RecentActivity } from "./_components/recent-activity"
import { StatCards } from "./_components/stat-cards"
import { WeeklyTrend } from "./_components/weekly-trend"

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-zinc-900 md:text-[32px]">
          Welcome back, Admin
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Here&apos;s the attendance overview for today, October 24th, 2023.
        </p>
      </div>

      <StatCards />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <WeeklyTrend />
        <QuickActions />
      </div>

      <RecentActivity />
    </div>
  )
}
