"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { Lightbox } from "@/components/gallery/lightbox";
import { PlayBadge } from "@/components/gallery/play-badge";
import type { Shot } from "@/data/gallery";
import { cn } from "@/lib/utils";

const TILE =
  "relative overflow-hidden rounded-2xl border border-line bg-bg3 p-0 transition-[transform,border-color] duration-350 hover:-translate-y-1 hover:border-acc";

/**
 * Home strip: a 4-column mosaic where the first tile takes a 2x2 block and the
 * last one spans the leftover row, so no tile is left stranded beside empties.
 */
function stripSpan(index: number) {
  if (index === 0) return "sm:col-span-2 sm:row-span-2";
  if (index === 5) return "sm:col-span-2 lg:col-span-4";
  return "";
}

export function GalleryGrid({
  shots,
  variant,
}: {
  shots: readonly Shot[];
  variant: "strip" | "page";
}) {
  const [openIndex, setOpenIndex] = useState(-1);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex(
        (current) => (current + delta + shots.length) % shots.length,
      ),
    [shots.length],
  );

  const close = useCallback(() => setOpenIndex(-1), []);

  return (
    <>
      <div
        className={cn(
          "grid gap-3",
          variant === "strip"
            ? "grid-cols-2 [grid-auto-rows:170px] lg:grid-cols-4"
            : "grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {shots.map((shot, index) => (
          <button
            key={shot.id}
            type="button"
            data-reveal=""
            onClick={() => setOpenIndex(index)}
            aria-label={`Open ${shot.caption}`}
            className={cn(
              TILE,
              variant === "strip"
                ? stripSpan(index)
                : "flex h-full flex-col rounded-card bg-bg2 text-left",
            )}
          >
            <span
              className={cn(
                "relative block w-full",
                variant === "strip" ? "h-full" : "aspect-4/3",
              )}
            >
              <Image
                src={shot.thumb}
                alt={shot.alt}
                fill
                sizes="(max-width: 860px) 50vw, 33vw"
                className="object-cover"
              />
              {shot.video ? <PlayBadge /> : null}
            </span>

            {variant === "strip" ? (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3.5 text-left text-[13px] font-semibold text-white">
                {shot.caption}
              </span>
            ) : (
              <span className="mt-auto flex items-center justify-between gap-3 bg-bg2 px-4.5 py-4 text-left">
                <span>
                  <span className="block text-[15px] font-bold text-fg">
                    {shot.caption}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-fg2">
                    {shot.by}
                  </span>
                </span>
                <span className="rounded-full border border-line px-2.5 py-1.5 text-[11px] font-bold tracking-[0.12em] whitespace-nowrap text-fg2 uppercase">
                  {shot.tag}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {openIndex >= 0 ? (
        <Lightbox
          shots={shots}
          index={openIndex}
          onClose={close}
          onStep={step}
        />
      ) : null}
    </>
  );
}
