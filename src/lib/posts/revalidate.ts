import { revalidatePath } from "next/cache";

/**
 * Public surfaces cache aggressively, so a visibility change is pushed through
 * immediately rather than waiting for the 60-second window.
 */
export function revalidatePost(slug: string) {
  revalidatePath("/posts");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/rss.xml");
  revalidatePath("/sitemap.xml");
}
