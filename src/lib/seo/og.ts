import { siteOrigin } from "../siteMetadata.ts";

/**
 * A generated social card. Titles travel as query parameters, so the image
 * changes with the page without shipping a per-page static asset.
 */
export function ogImageUrl(input: {
  title: string;
  subtitle?: string;
  kind?: string;
}): string {
  const params = new URLSearchParams({ title: input.title });
  if (input.subtitle) params.set("subtitle", input.subtitle);
  if (input.kind) params.set("kind", input.kind);
  return `${siteOrigin}/og?${params.toString()}`;
}
