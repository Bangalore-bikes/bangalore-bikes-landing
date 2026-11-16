import { z } from "zod";

const text = z.string().trim().min(1).max(8000);
const timestamp = z
  .string()
  .datetime({ offset: true })
  .refine(
    (value) => Number.isFinite(Date.parse(value)),
    "Use a valid ISO timestamp",
  );
const source = z
  .object({
    label: text.max(180),
    url: z
      .string()
      .refine(
        (value) =>
          [...value].every(
            (char) => char.charCodeAt(0) > 32 && char.charCodeAt(0) !== 127,
          ),
        "URLs must not contain whitespace or control characters",
      )
      .pipe(z.string().url())
      .refine((value) => {
        try {
          const url = new URL(value);
          return (
            url.protocol === "https:" &&
            !url.username &&
            !url.password
          );
        } catch {
          return false;
        }
      }, "Use an HTTPS source link without credentials"),
  })
  .strict();

const block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text }).strict(),
  z.object({ type: z.literal("heading"), text: text.max(200) }).strict(),
  z
    .object({ type: z.literal("list"), items: z.array(text).min(1).max(50) })
    .strict(),
]);

export const articleSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: text.max(180),
    summary: text.max(600),
    author: text.max(180),
    status: z.enum(["draft", "published"]),
    permissionConfirmed: z.boolean(),
    publishedAt: timestamp.optional(),
    updatedAt: timestamp,
    blocks: z.array(block).min(1).max(100),
    sources: z.array(source).max(30),
  })
  .strict()
  .superRefine((article, ctx) => {
    if (
      article.status === "published" &&
      (!article.permissionConfirmed || !article.publishedAt)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Publication requires author permission and a publication date",
      });
    }
    if (
      article.publishedAt &&
      Date.parse(article.updatedAt) < Date.parse(article.publishedAt)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["updatedAt"],
        message: "Update cannot precede publication",
      });
    }
  });

export type CommunityArticle = z.infer<typeof articleSchema>;

export function parseArticles(input: unknown) {
  const articles = z.array(articleSchema).parse(input);
  if (
    new Set(articles.map((article) => article.slug)).size !== articles.length
  ) {
    throw new Error("Article slugs must be unique");
  }
  return articles;
}

export function publishedArticles(input: unknown) {
  return parseArticles(input)
    .filter((article) => article.status === "published")
    .sort(
      (a, b) =>
        Date.parse(b.publishedAt ?? b.updatedAt) -
        Date.parse(a.publishedAt ?? a.updatedAt),
    );
}
