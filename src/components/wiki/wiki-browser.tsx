"use client";

import Link from "next/link";
import { useState } from "react";

import { WIKI_SECTIONS } from "@/data/wiki";
import { cn } from "@/lib/utils";

const number = (index: number) => String(index + 1).padStart(2, "0");

function SectionLink({ href, label }: { href: string; label: string }) {
  const className =
    "inline-flex h-13 items-center gap-2.5 self-start rounded-full bg-fg px-6 font-bold text-bg transition-colors hover:bg-acc hover:text-acc-fg";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {label} →
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label} ↗
    </a>
  );
}

export function WikiBrowser() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = WIKI_SECTIONS[activeIndex];

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[280px_1fr]">
      <nav
        aria-label="Wiki sections"
        className="flex gap-2 overflow-x-auto lg:sticky lg:top-22 lg:flex-col lg:overflow-visible"
      >
        {WIKI_SECTIONS.map((section, index) => (
          <button
            key={section.id}
            type="button"
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "rounded-xl border px-4.5 py-3.5 text-left text-[15px] font-semibold whitespace-nowrap transition-colors",
              index === activeIndex
                ? "border-acc bg-bg2 text-fg"
                : "border-transparent text-fg2 hover:text-fg",
            )}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-3.5">
        <div className="rounded-card border border-line bg-bg2 p-6 md:p-10">
          <h2 className="font-display m-0 mb-3 text-[clamp(24px,2.6vw,34px)] font-bold tracking-[-0.03em]">
            {active.title}
          </h2>
          <p className="m-0 mb-7 text-base leading-relaxed text-fg2">
            {active.intro}
          </p>

          <ol className="m-0 flex list-none flex-col gap-3.5 p-0">
            {active.items.map((item, index) => (
              <li
                key={item.h}
                className="flex items-start gap-4.5 border-t border-line py-4"
              >
                <span className="font-display min-w-7 pt-1 text-[13px] font-bold text-acc">
                  {number(index)}
                </span>
                <div>
                  <div className="mb-1 text-[17px] font-bold">{item.h}</div>
                  <div className="text-[15px] leading-relaxed text-fg2">
                    {item.d}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {active.link && active.linkLabel ? (
          <SectionLink href={active.link} label={active.linkLabel} />
        ) : null}
      </div>
    </div>
  );
}
