import Link from "next/link";

import { cn } from "@/lib/utils";

/** Page-width container. Every section on the site shares this gutter. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1280px] px-5 md:px-10", className)}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  aside,
  action,
}: {
  eyebrow?: string;
  title: string;
  aside?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      data-reveal=""
      className="mb-11 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
    >
      <div className="max-w-[640px]">
        {eyebrow ? (
          <div className="mb-3.5 text-[13px] font-semibold tracking-[0.18em] text-acc uppercase">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="font-display m-0 text-[clamp(30px,4.5vw,56px)] leading-none font-bold tracking-[-0.03em] uppercase">
          {title}
        </h2>
      </div>
      {aside ? (
        <p className="m-0 max-w-[380px] text-base leading-relaxed text-fg2">
          {aside}
        </p>
      ) : null}
      {action}
    </div>
  );
}

export function ArrowLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "inline-flex items-center gap-2 border-b-2 border-acc pb-1 text-[15px] font-bold whitespace-nowrap transition-colors hover:text-acc";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children} ↗
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children} →
    </Link>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line px-2.5 py-1.5 text-[11px] font-bold tracking-[0.12em] whitespace-nowrap text-fg2 uppercase">
      {children}
    </span>
  );
}
