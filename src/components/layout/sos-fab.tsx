"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Always-available emergency shortcut, hidden on the SOS page itself. */
export function SosFab() {
  const pathname = usePathname();

  if (pathname.startsWith("/sos")) return null;

  return (
    <Link
      href="/sos"
      aria-label="SOS emergency"
      className="font-display fixed right-5 bottom-5 z-70 grid h-18 w-18 place-items-center rounded-full bg-sos text-[15px] font-black tracking-[0.04em] text-white shadow-[0_10px_30px_rgba(0,0,0,.35)] transition-transform hover:scale-108"
    >
      <span className="animate-ring absolute inset-0 rounded-full border-[3px] border-sos" />
      <span
        className="animate-ring absolute inset-0 rounded-full border-[3px] border-sos"
        style={{ animationDelay: "0.7s" }}
      />
      <span className="relative">SOS</span>
    </Link>
  );
}
