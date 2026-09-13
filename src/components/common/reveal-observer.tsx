"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL_SELECTOR = '[data-reveal=""]';

/**
 * Marks every `data-reveal` element visible as it scrolls into view. Mounted
 * once in the root layout so page content can stay server-rendered: sections
 * only need the `data-reveal` attribute, no client component of their own.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
    );

    if (nodes.length === 0) return;

    // Without IntersectionObserver (or with motion reduced) the CSS fallback
    // would leave content invisible, so reveal everything immediately.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (typeof IntersectionObserver === "undefined" || reduceMotion) {
      nodes.forEach((node) => node.setAttribute("data-reveal", "in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-reveal", "in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
