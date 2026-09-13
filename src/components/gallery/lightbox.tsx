"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { Shot } from "@/data/gallery";

const ROUND_BUTTON =
  "grid h-13 w-13 shrink-0 place-items-center rounded-full border border-white/25 bg-white/6 text-xl text-white";

export function Lightbox({
  shots,
  index,
  onClose,
  onStep,
}: {
  shots: readonly Shot[];
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const shot = shots[index];
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStep]);

  // Video bytes are fetched here and nowhere else, and only for the clip the
  // viewer actually opened.
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !shot?.video) return;

    video.src = shot.video;
    video.play().catch(() => {
      /* autoplay refused: controls are visible, the viewer can start it */
    });
  }, [shot?.video]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  if (!shot) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shot.caption}
      onClick={onClose}
      className="animate-rise fixed inset-0 z-90 flex flex-col bg-[rgba(6,6,8,.94)] backdrop-blur-[6px]"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4.5 text-white">
        <div className="text-[13px] font-bold tracking-[0.14em] whitespace-nowrap text-acc uppercase">
          {shot.tag} · {index + 1} / {shots.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-lg text-white"
        >
          ✕
        </button>
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className="flex min-h-0 flex-1 items-center gap-3.5 px-5 pb-2"
      >
        <button
          type="button"
          onClick={() => onStep(-1)}
          aria-label="Previous"
          className={ROUND_BUTTON}
        >
          ←
        </button>

        <div className="relative h-full min-w-0 flex-1 overflow-hidden rounded-card border border-white/14 bg-black">
          {shot.video ? (
            <video
              key={shot.id}
              ref={videoRef}
              poster={shot.full}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 block h-full w-full bg-black object-contain"
            />
          ) : (
            <Image
              src={shot.full}
              alt={shot.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label="Next"
          className={ROUND_BUTTON}
        >
          →
        </button>
      </div>

      <div className="flex flex-wrap justify-between gap-5 px-5 pt-4 pb-6.5 text-white">
        <div className="font-display text-[clamp(16px,2vw,22px)] font-bold tracking-[-0.02em]">
          {shot.caption}
        </div>
        <div className="text-sm opacity-70">
          {shot.by} · {shot.place}
        </div>
      </div>
    </div>
  );
}
