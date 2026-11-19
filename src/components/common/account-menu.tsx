"use client";

import { ChevronDown } from "lucide-react";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type Viewer = { displayName: string; handle: string; role: string } | null;

/** undefined while loading, null when signed out. */
function useViewer() {
  const [viewer, setViewer] = useState<Viewer | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setViewer(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setViewer(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return { viewer, setViewer };
}

async function logOut() {
  try {
    await fetch("/api/account/logout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
  } finally {
    window.location.assign("/");
  }
}

function links(viewer: NonNullable<Viewer>) {
  return [
    { href: "/write", label: "Write a post" },
    { href: "/drafts", label: "Your posts" },
    { href: `/writers/${viewer.handle}`, label: "Public profile" },
    { href: "/account/security", label: "Account security" },
    ...(viewer.role === "moderator" ? [{ href: "/moderation", label: "Moderation" }] : []),
  ];
}

export function AccountMenu() {
  const { viewer } = useViewer();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (viewer === undefined) {
    return <div aria-hidden="true" className="h-9 w-40" />;
  }

  if (!viewer) {
    return (
      <>
        <Button asChild variant="ghost">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Sign up</Link>
        </Button>
      </>
    );
  }

  return (
    <div ref={box} className="relative">
      <Button
        variant="outline"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="max-w-32 truncate">{viewer.displayName}</span>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
        >
          {links(viewer).map((item) => (
            <Link
              key={item.href}
              role="menuitem"
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => void logOut()}
            className="mt-1 block w-full rounded-md border-t border-border px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

/** Stacked version for the mobile sheet. */
export function AccountLinks() {
  const { viewer } = useViewer();
  if (viewer === undefined) return null;
  if (!viewer) {
    return (
      <>
        <Button asChild variant="outline">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Sign up</Link>
        </Button>
      </>
    );
  }
  return (
    <>
      <p className="text-sm text-muted-foreground">Signed in as {viewer.displayName}</p>
      {links(viewer).map((item) => (
        <Button asChild variant="outline" key={item.href}>
          <Link href={item.href}>{item.label}</Link>
        </Button>
      ))}
      <Button variant="ghost" onClick={() => void logOut()}>
        Log out
      </Button>
    </>
  );
}
