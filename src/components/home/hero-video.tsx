"use client";

import { useEffect, useRef } from "react";

import { HERO_POSTER, HERO_VIDEO } from "@/data/media";

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Honour Save-Data and 2G: poster only, no video bytes at all. */
function wantsVideo() {
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;

  if (!connection) return true;

  return (
    !connection.saveData && !/(^|-)2g$/.test(connection.effectiveType ?? "")
  );
}

function whenIdle(run: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(run, { timeout: 1500 });
  }
  return window.setTimeout(run, 300);
}

/**
 * The poster paints immediately; the clip is attached only after first paint so
 * it never competes with the fonts and above-the-fold images.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;

    if (!video || !wantsVideo()) return;

    const handle = whenIdle(() => {
      video.src = HERO_VIDEO;
      video.play().catch(() => {
        /* autoplay refused: the poster stays, which is a fine fallback */
      });
    });

    return () => {
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(handle as number);
      } else {
        window.clearTimeout(handle as number);
      }
    };
  }, []);

  return (
    <video
      ref={ref}
      poster={HERO_POSTER}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className="absolute inset-0 block h-full w-full object-cover"
    />
  );
}
