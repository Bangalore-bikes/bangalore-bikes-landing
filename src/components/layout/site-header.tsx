"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LINKS, NAV_ITEMS } from "@/data/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Any navigation closes the sheet, including browser back/forward.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-60 border-b border-line bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] backdrop-blur-[14px]">
      <div className="mx-auto flex h-[68px] w-full max-w-[1280px] items-center justify-between gap-6 px-5 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt=""
            width={36}
            height={36}
            priority
            className="block rounded-full"
          />
          <span className="font-display text-[15px] leading-none font-bold tracking-[-0.02em]">
            BANGALORE
            <br />
            BIKES
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-bg3 text-fg" : "text-fg2 hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-10 items-center rounded-full bg-acc px-[18px] text-sm font-bold whitespace-nowrap text-acc-fg transition-transform hover:-translate-y-px lg:inline-flex"
          >
            Join WhatsApp
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-bg2 text-fg lg:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="animate-rise flex flex-col gap-1 border-t border-line bg-bg px-5 pt-3 pb-6 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-display border-b border-line px-1 py-3 text-[22px] font-bold"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-13 items-center justify-center rounded-full bg-acc font-bold text-acc-fg"
          >
            Join WhatsApp community
          </a>
        </div>
      ) : null}
    </header>
  );
}
