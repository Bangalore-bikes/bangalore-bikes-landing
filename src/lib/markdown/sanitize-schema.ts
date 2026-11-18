import { defaultSchema } from "rehype-sanitize";

/**
 * Strict allowlist applied after the Markdown has been converted to HTML.
 *
 * Raw HTML in a post never reaches the tree (remark drops it), so this is the
 * last line of defence rather than the first. Classes are deliberately absent:
 * the element type carries the styling contract, so untrusted markup cannot
 * reach Tailwind utility classes or other layout controls.
 */
export const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    "p",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "strong",
    "em",
    "del",
    "code",
    "pre",
    "blockquote",
    "aside",
    "section",
    "details",
    "summary",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr",
    "br",
    "img",
    "figure",
    "figcaption",
    "div",
    "span",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "width", "height", "loading"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    aside: ["data-callout"],
    figure: ["data-gallery"],
    section: ["data-faq"],
    div: ["data-map"],
    details: ["open"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
    src: ["https"],
  },
};
