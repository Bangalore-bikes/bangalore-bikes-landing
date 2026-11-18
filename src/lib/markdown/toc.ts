import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

type TextNode = { type: string; value?: string; children?: TextNode[] };

function textOf(node: TextNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

/**
 * Reads the rendered HTML rather than the Markdown source so the ids always
 * match what the reader can actually click, including the sanitiser's prefix.
 */
export function collectHeadings(html: string): TocEntry[] {
  const headings: TocEntry[] = [];
  visit(fromHtml(html, { fragment: true }), "element", (node) => {
    if (node.tagName !== "h2" && node.tagName !== "h3") return;
    const id = node.properties.id;
    const text = textOf(node).trim();
    if (typeof id !== "string" || !id || !text) return;
    headings.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
  });
  return headings;
}
