const DATE = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "long",
  timeZone: "Asia/Kolkata",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : DATE.format(date);
}

/** 220 words a minute is the usual reading estimate for prose. */
export function readingMinutes(markdown: string): number {
  const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 220));
}

export function tagLabel(tag: string): string {
  return tag
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}
