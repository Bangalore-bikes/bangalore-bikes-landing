export type TocEntry = { id: string; text: string; level: 2 | 3 };

const HEADING = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g;
const ID = /\sid="([^"]+)"/;

function decode(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Reads the rendered HTML rather than the Markdown source so the ids always
 * match what the reader can actually click, including the sanitiser's prefix.
 */
export function collectHeadings(html: string): TocEntry[] {
  const headings: TocEntry[] = [];
  for (const match of html.matchAll(HEADING)) {
    const id = ID.exec(match[2])?.[1];
    const text = decode(match[3]);
    if (!id || !text) continue;
    headings.push({ id, text, level: match[1] === "2" ? 2 : 3 });
  }
  return headings;
}
