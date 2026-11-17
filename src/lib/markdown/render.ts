import type { Content, Link, Paragraph, Root as MdastRoot } from "mdast";
import type { Element, Root as HastRoot } from "hast";
import type { Node } from "unist";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";

import { sanitizeSchema } from "./sanitize-schema.ts";
import { collectHeadings, type TocEntry } from "./toc.ts";

export type { TocEntry };

type DirectiveNode = Node & {
  name?: string;
  attributes?: Record<string, string | null | undefined> | null;
  children?: Node[];
};

const CALLOUT_KINDS = new Set(["note", "tip", "warning", "danger"]);
const SUPPORTED_DIRECTIVES = new Set(["callout", "gallery", "map", "faq"]);
const SAFE_HREF = /^(https?:|mailto:|#|\/)/i;
const SAFE_SRC = /^https:\/\//i;

/** Applies a hast element name to an mdast node without widening to `any`. */
function asElement<T extends Content>(
  node: T,
  hName: string,
  properties: Record<string, string> = {},
): T {
  (node as unknown as { data: unknown }).data = {
    hName,
    hProperties: properties,
  };
  return node;
}

function attribute(node: DirectiveNode, key: string): string | null {
  const value = node.attributes?.[key];
  return typeof value === "string" ? value : null;
}

function nodeText(node: Node): string {
  if (node.type === "text") {
    return (node as Node & { value?: string }).value ?? "";
  }
  const children = (node as Node & { children?: Node[] }).children ?? [];
  return children.map(nodeText).join("");
}

type FaqGroup = { question: string; answer: Content[] };

function splitFaq(children: Node[]): FaqGroup[] {
  const groups: FaqGroup[] = [];
  let current: FaqGroup | null = null;
  for (const child of children as Content[]) {
    if (child.type === "heading" && child.depth === 3) {
      current = { question: nodeText(child).trim(), answer: [] };
      groups.push(current);
      continue;
    }
    if (!current) {
      current = { question: "", answer: [] };
      groups.push(current);
    }
    current.answer.push(child);
  }
  return groups.filter((group) => group.question.length > 0);
}

function faqItem(group: FaqGroup): Content {
  const summary = asElement<Paragraph>(
    { type: "paragraph", children: [{ type: "text", value: group.question }] },
    "summary",
  );
  const body: Content = {
    type: "blockquote",
    children: [summary, ...group.answer],
  } as Content;
  return asElement(body, "details");
}

/**
 * Unknown directives are restored as their literal source so a typo never
 * silently deletes what the author wrote.
 */
function literalDirective(node: DirectiveNode, name: string): Content[] {
  const replacement: Content[] = [
    {
      type: "paragraph",
      children: [{ type: "text", value: `:::${name}` }],
    },
  ];
  replacement.push(...((node.children ?? []) as Content[]));
  if (node.type === "containerDirective") {
    replacement.push({
      type: "paragraph",
      children: [{ type: "text", value: ":::" }],
    });
  }
  return replacement;
}

/**
 * Converts the four supported directives into semantic elements. Unknown or
 * malformed directives are left alone, which renders them as plain text rather
 * than failing the submission and losing the author's work.
 */
function remarkDirectives() {
  return (tree: MdastRoot) => {
    visit(tree, (node, index, parent) => {
      if (index === undefined || !parent) return;
      const directive = node as DirectiveNode;
      const name = directive.name ?? "";
      const isContainer = node.type === "containerDirective";
      const isLeaf = node.type === "leafDirective";

      if ((isContainer || isLeaf) && !SUPPORTED_DIRECTIVES.has(name)) {
        const replacement = literalDirective(directive, name);
        parent.children.splice(index, 1, ...replacement);
        return [SKIP, index + replacement.length];
      }

      if (node.type === "containerDirective" && name === "callout") {
        const requested = attribute(directive, "type")?.toLowerCase() ?? "note";
        const kind = CALLOUT_KINDS.has(requested) ? requested : "note";
        const aside: Content = {
          type: "blockquote",
          children: directive.children ?? [],
        } as Content;
        parent.children[index] = asElement(aside, "aside", {
          "data-callout": kind,
        });
        return;
      }

      if (node.type === "containerDirective" && name === "gallery") {
        const figure: Content = {
          type: "blockquote",
          children: directive.children ?? [],
        } as Content;
        parent.children[index] = asElement(figure, "figure", {
          "data-gallery": "",
        });
        return;
      }

      if (node.type === "containerDirective" && name === "faq") {
        const groups = splitFaq(directive.children ?? []);
        if (groups.length === 0) return;
        const section: Content = {
          type: "blockquote",
          children: groups.map(faqItem),
        } as Content;
        parent.children[index] = asElement(section, "section", {
          "data-faq": "",
        });
        return;
      }

      if (name === "map" && (isContainer || isLeaf)) {
        const place = (attribute(directive, "place") ?? "").trim().slice(0, 120);
        if (!place) return;
        const link: Link = {
          type: "link",
          url: `https://www.openstreetmap.org/search?query=${encodeURIComponent(
            place,
          )}`,
          children: [{ type: "text", value: `Open ${place} on OpenStreetMap` }],
        };
        const panel = asElement<Paragraph>(
          { type: "paragraph", children: [link] },
          "div",
          { "data-map": place },
        );
        const replacement: Content[] = [
          panel,
          ...((directive.children ?? []) as Content[]),
        ];
        parent.children.splice(index, 1, ...replacement);
        return [SKIP, index + replacement.length];
      }
    });
  };
}

/**
 * Defensive hardening after Markdown conversion. The sanitiser runs afterwards;
 * this makes the intent explicit and keeps unsafe schemes out of the tree even
 * if the allowlist is ever loosened.
 */
function rehypeHardenLinks() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a" && typeof node.properties?.href === "string") {
        const href = node.properties.href;
        if (!SAFE_HREF.test(href)) {
          delete node.properties.href;
          return;
        }
        if (/^https?:/i.test(href)) {
          node.properties.rel = ["noopener", "nofollow", "ugc"];
          node.properties.target = "_blank";
        }
        return;
      }
      if (node.tagName === "img") {
        const src = node.properties?.src;
        if (typeof src !== "string" || !SAFE_SRC.test(src)) {
          delete node.properties?.src;
        }
        node.properties = { ...node.properties, loading: "lazy" };
      }
    });
  };
}

/**
 * Renders contributor Markdown to HTML that is safe to place in the document.
 * Raw HTML is dropped, directives map to a closed element set, and the result
 * is sanitised against a strict allowlist.
 */
export async function renderMarkdown(
  markdown: string,
): Promise<{ html: string; headings: TocEntry[] }> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkDirectives)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeHardenLinks)
    .use(rehypeSlug)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(markdown);

  const html = String(file);
  return { html, headings: collectHeadings(html) };
}
