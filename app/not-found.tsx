import Link from "next/link";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";

/**
 * 404. Most arrivals here are a mistyped address or a stale link, so it offers
 * the two things a staff member actually wants rather than an apology.
 */
export default function NotFound() {
  return (
    <Screen className="items-center justify-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Page not found</p>
        <h1 className="text-2xl font-semibold text-foreground">
          That page does not exist
        </h1>
        <p className="text-sm text-muted-foreground">
          The link may be out of date. To record attendance, scan the printed
          code at your office.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button render={<Link href="/home" />} nativeButton={false} size="xl" className="w-full">
          Go to home
        </Button>
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          variant="outline"
          size="lg"
          className="w-full"
        >
          Sign in
        </Button>
      </div>
    </Screen>
  );
}
