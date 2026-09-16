import Link from "next/link";
import { MapPin, QrCode, Smartphone } from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { Screen } from "@/components/screen";
import { Button } from "@/components/ui/button";

/**
 * / - the public entry point.
 *
 * Deliberately thin. Staff reach attendance by scanning the printed QR at their
 * office, which opens /scan directly; this page exists for the first visit and
 * for anyone who typed the address. No hero image and no marketing copy - it
 * loads on a phone, often on a slow connection, and every kilobyte here is a
 * kilobyte before someone can sign in.
 *
 * No server component work is needed, so this stays one without "use client".
 */
export default function EntryPage() {
  return (
    <Screen className="justify-center gap-10">
      <header className="flex flex-col items-center gap-5 text-center">
        <BrandLockup />
        <p className="text-base text-balance text-muted-foreground">
          Sign in and out at your office by scanning the code on your registered
          phone.
        </p>
      </header>

      <ul className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <HowItWorks icon={<QrCode aria-hidden="true" className="size-5" />}>
          Scan the printed code at your office with your phone camera.
        </HowItWorks>
        <HowItWorks icon={<MapPin aria-hidden="true" className="size-5" />}>
          Your location is checked at that moment, and only then.
        </HowItWorks>
        <HowItWorks icon={<Smartphone aria-hidden="true" className="size-5" />}>
          Attendance records from your own registered phone.
        </HowItWorks>
      </ul>

      <div className="flex flex-col gap-3">
        <Button render={<Link href="/login" />} nativeButton={false} size="xl" className="w-full">
          Sign in
        </Button>
        <Button
          render={<Link href="/register" />}
          nativeButton={false}
          variant="outline"
          size="lg"
          className="w-full"
        >
          Register your staff ID
        </Button>
      </div>
    </Screen>
  );
}

function HowItWorks({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span className="text-sm text-muted-foreground">{children}</span>
    </li>
  );
}
