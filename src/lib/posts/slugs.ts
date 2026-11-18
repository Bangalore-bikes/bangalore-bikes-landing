export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * Slugs are permanent once a post is published, so collisions are resolved by
 * suffixing rather than overwriting someone else's URL.
 */
export function uniqueSlug(base: string, taken: string[]): string {
  const root = base || "post";
  if (!taken.includes(root)) return root;
  let suffix = 2;
  while (taken.includes(`${root}-${suffix}`)) suffix += 1;
  return `${root}-${suffix}`;
}
