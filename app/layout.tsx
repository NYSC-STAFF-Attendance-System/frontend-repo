import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OfflineBanner } from "@/components/offline-banner";
import { StoreProvider } from "@/lib/store/provider";
import { cn } from "@/lib/utils";

// Single font for the whole app. Staff open this on phones, often on slow
// connections, so every extra font file is a delay before text renders.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NYSC Staff Attendance",
  description: "Sign in and out at your NYSC office.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The app ships one colour scheme. Declaring it stops mobile browsers from
  // auto-darkening form controls, which would break the contrast we verify.
  colorScheme: "light",
  themeColor: "#F8F9FB",
};

/**
 * Root layout. Wraps every route in the app.
 *
 * Owns the html and body tags, loads the font, and pulls in global styles.
 * Deliberately thin: no header, no nav. The bottom navigation belongs to the
 * (protected) layout, because the public screens must not show it.
 *
 * The offline bar is the one exception. It sits here so it appears on every
 * screen including /scan, where losing signal matters most.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", inter.variable, "font-sans")}>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <OfflineBanner />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
