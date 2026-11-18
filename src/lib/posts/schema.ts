import { z } from "zod";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TAG = /^[a-z0-9-]{2,24}$/;

const coverImageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => value === "" || /^https:\/\/[^\s]+$/i.test(value),
    "Cover images must use an https URL",
  )
  .optional();

/**
 * Everything an author can change about a post. Identity, status, author and
 * timestamps are server-controlled and deliberately absent here.
 *
 * The summary minimum exists because it is rendered as the answer-first TL;DR
 * block and used as the meta description; a one-line stub cannot do that job.
 */
export const postInputSchema = z
  .object({
    title: z.string().trim().min(8, "Use at least 8 characters").max(120),
    summary: z
      .string()
      .trim()
      .min(40, "Write at least 40 characters so the summary can stand alone")
      .max(2000),
    bodyMd: z.string().trim().min(1, "A post needs a body").max(60000),
    tags: z.array(z.string().trim().regex(TAG, "Use lowercase tags")).max(5).default([]),
    coverImageUrl,
    slug: z.string().trim().regex(SLUG, "Use a lowercase slug").max(80).optional(),
  })
  .strict();

export type PostInput = z.infer<typeof postInputSchema>;

export const postStatuses = [
  "draft",
  "pending",
  "published",
  "rejected",
  "unpublished",
] as const;

export type PostStatus = (typeof postStatuses)[number];

export function isPostStatus(value: string): value is PostStatus {
  return (postStatuses as readonly string[]).includes(value);
}
