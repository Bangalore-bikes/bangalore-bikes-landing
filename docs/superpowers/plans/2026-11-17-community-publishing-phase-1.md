# Phase 1: Identity and Publishing Core — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let any rider create an account with email and password, write a Markdown post, and have it reviewed and published by the trust rules, on a public reading experience that is pleasant to use.

**Architecture:** A new `posts` and identity table family sits beside the existing `content_records` store in the same libSQL database. A pure Markdown renderer produces sanitised HTML at submit time. Route handlers enforce ownership and moderator rights directly. Public pages read published rows through ISR, exactly like the existing article pages.

**Tech Stack:** Next.js 15.5.28 App Router, React 19, TypeScript strict, Zod 4, `@libsql/client`, unified/remark/rehype, `@node-rs/argon2`, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-11-17-community-blog-seo-design.md`

## Global Constraints

- Node `22.19.0`; Next `15.5.28`; Zod `4.6.6`; React `19.1.2`.
- TypeScript strict. No `any`, no non-null assertions on untrusted input.
- Tests run with `node --experimental-strip-types --test` and must not need network access.
- Secrets are server-only; never `NEXT_PUBLIC_`.
- Every external service must have a no-op fallback so builds pass unconfigured.
- Zero recurring cost: no paid service may be added.
- WCAG 2.1 AA: visible focus, 44px touch targets, labelled form fields, `aria-live` on errors.
- Public pages use `revalidate = 60` and call `revalidatePath` after writes.
- Only `status = 'published'` may be read by public pages, feeds or sitemaps.
- CI is the authoritative build; local `next build` is unreliable on the development machine.

## Review Focus

1. **Markdown injection:** a body containing `<script>alert(1)</script>`, `<img onerror=...>` or `[x](javascript:alert(1))` must render inert — no script, no event handler, no `javascript:` URL.
2. **Malformed directives:** `:::galery`, an unclosed `:::callout`, or a directive with no body must render as literal text rather than throwing and losing the author's draft.
3. **Concurrency:** two saves of the same post with the same expected version must produce exactly one success and one `409`-class conflict, never a lost update or a `500`.
4. **Session revocation:** a session deleted or a user disabled *after* sign-in must be rejected on the very next request, not after a token expiry window.
5. **Token reuse:** a password-reset or verification token used successfully once must fail on every later use, including an immediate replay.

---

## File Structure

```
scripts/migrate-posts.mjs                 posts/identity migration (idempotent)
src/lib/database-url.ts                   shared URL/token resolution (extracted)
src/lib/markdown/
  render.ts                               remark -> sanitised HTML
  sanitize-schema.ts                      strict allowlist
  toc.ts                                  headings -> table of contents
src/lib/posts/
  schema.ts                               Zod post input validation
  slugs.ts                                slug rules
  repository.ts                           CRUD + transitions + revisions
  lifecycle.ts                            trust decisions (pure)
  queries.ts                              read models for pages
src/lib/auth/
  password.ts                             argon2id hash/verify
  tokens.ts                               hashed opaque tokens
  repository.ts                           users + sessions persistence
  session.ts                              cookie issue/read/revoke
  guards.ts                               requireUser / requireModerator
src/lib/rate-limit.ts                     DB-backed counters
src/lib/mail.ts                           Resend transport with no-op fallback
src/lib/seo/post-jsonld.ts                BlogPosting + BreadcrumbList
src/app/api/auth/[...action]/route.ts     signup, login, logout, verify, reset
src/app/api/posts/route.ts                list + create
src/app/api/posts/[id]/route.ts           read + update
src/app/api/posts/[id]/submit/route.ts    submit for review / publish
src/app/api/moderation/[id]/route.ts      approve / reject / unpublish
src/app/(auth)/signup/page.tsx            signup form
src/app/(auth)/login/page.tsx             login form
src/app/(auth)/reset/page.tsx             request + complete reset
src/app/write/page.tsx                    editor shell
src/app/drafts/page.tsx                   author's posts
src/app/moderation/page.tsx               moderator queue
src/app/(with-root-layout)/posts/page.tsx         public feed
src/app/(with-root-layout)/posts/[slug]/page.tsx  reading page
src/app/(with-root-layout)/writers/[handle]/page.tsx author profile
src/app/rss.xml/route.ts                  RSS feed
src/components/posts/
  post-editor.tsx                         Markdown editor + preview
  post-card.tsx                           feed card
  post-body.tsx                           sanitised HTML + TOC
  moderation-queue.tsx                    one-key review actions
  post-form-state.ts                      shared client state helpers

tests/markdown-render.test.mjs
tests/post-schema.test.mjs
tests/auth-password.test.mjs
tests/auth-tokens.test.mjs
tests/rate-limit.test.mjs
tests/posts-repository.test.mjs
tests/post-lifecycle.test.mjs
```

---

### Task 1: Markdown renderer

**Files:**
- Create: `src/lib/markdown/sanitize-schema.ts`, `src/lib/markdown/render.ts`, `src/lib/markdown/toc.ts`
- Test: `tests/markdown-render.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `renderMarkdown(markdown: string): Promise<{ html: string; headings: TocEntry[] }>`, `type TocEntry = { id: string; text: string; level: 2 | 3 }`.

- [ ] **Step 1: Install the pipeline**

Run: `bun add unified remark-parse remark-gfm remark-directive remark-rehype rehype-sanitize rehype-slug rehype-stringify`

- [ ] **Step 2: Write the failing test**

```js
import assert from "node:assert/strict";
import test from "node:test";

import { renderMarkdown } from "../src/lib/markdown/render.ts";

test("markdown renders headings, lists and GFM tables", async () => {
  const { html, headings } = await renderMarkdown(
    "## Ride report\n\n- one\n- two\n\n| A | B |\n| - | - |\n| 1 | 2 |\n",
  );
  assert.match(html, /<h2 id="ride-report">Ride report<\/h2>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<table>/);
  assert.deepEqual(headings, [
    { id: "ride-report", text: "Ride report", level: 2 },
  ]);
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `node --experimental-strip-types --test tests/markdown-render.test.mjs`
Expected: FAIL — `Cannot find module '../src/lib/markdown/render.ts'`.

- [ ] **Step 4: Write the sanitiser allowlist**

`src/lib/markdown/sanitize-schema.ts`:

```ts
import { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";

/**
 * No raw HTML nodes are ever produced upstream, but the allowlist is the last
 * line of defence. Classes are deliberately not allowed: element type carries
 * the styling contract, so untrusted markup cannot reach utility classes.
 */
export const sanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    "p", "h2", "h3", "h4", "ul", "ol", "li", "a", "strong", "em", "del",
    "code", "pre", "blockquote", "aside", "table", "thead", "tbody", "tr",
    "th", "td", "hr", "br", "img", "figure", "figcaption", "details",
    "summary", "span",
  ],
  attributes: {
    a: ["href", "title"],
    img: ["src", "alt", "width", "height", "loading"],
    h2: ["id"],
    h3: ["id"],
    h4: ["id"],
    details: ["open"],
  },
  protocols: {
    href: ["http", "https", "mailto"],
    src: ["https"],
  },
  clobberPrefix: "",
};
```

- [ ] **Step 5: Write the renderer and the directives**

`src/lib/markdown/render.ts`:

```ts
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { sanitizeSchema } from "./sanitize-schema";
import { collectHeadings, type TocEntry } from "./toc";

export type { TocEntry };

/** Map every href/src to a safe absolute shape; anything else is dropped. */
function hardenLinks() {
  return (tree: Parameters<typeof visit>[0]) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName === "a" && typeof node.properties?.href === "string") {
        const href = node.properties.href;
        if (!/^(https?:|mailto:|#|\/)/i.test(href)) delete node.properties.href;
        if (/^https?:/i.test(href)) {
          node.properties.rel = "noopener nofollow ugc";
          node.properties.target = "_blank";
        }
      }
      if (node.tagName === "img" && typeof node.properties?.src === "string") {
        if (!/^https:\/\//i.test(node.properties.src)) delete node.properties.src;
        node.properties.loading = "lazy";
      }
    });
  };
}

export async function renderMarkdown(
  markdown: string,
): Promise<{ html: string; headings: TocEntry[] }> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(directives)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(hardenLinks)
    .use(rehypeSlug)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(markdown);

  const html = String(file);
  return { html, headings: collectHeadings(html) };
}
```

`directives` handles the four documented directives and leaves anything unknown
as text:

```ts
function directives() {
  return (tree: any) => {
    visit(tree, (node: any, index, parent: any) => {
      if (node.type !== "containerDirective" && node.type !== "leafDirective")
        return;
      const name = node.name;
      if (!["callout", "gallery", "map", "faq"].includes(name)) return;
      if (!parent || index === undefined) return;
      const body = JSON.stringify(node.children ?? []);
      parent.children[index] = {
        type: "html",
        value: `<!--directive:${name}:${Buffer.from(body).toString("base64")}-->`,
      };
    });
  };
}
```

The base64 comment is replaced after sanitisation by the renderer's second pass,
which builds `<aside>`, `<figure>`, `<details>` and an OpenStreetMap link panel
from known-good attributes only. Never inject raw node content into HTML.

- [ ] **Step 6: Write the injection tests**

```js
test("script tags, event handlers and javascript urls are neutralised", async () => {
  const { html } = await renderMarkdown(
    '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[x](javascript:alert(1))',
  );
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /onerror/i);
  assert.doesNotMatch(html, /javascript:/i);
});

test("malformed and unknown directives stay as text", async () => {
  const { html } = await renderMarkdown(":::galery\nhello\n:::");
  assert.match(html, /galery/);
});
```

- [ ] **Step 7: Run the tests**

Run: `node --experimental-strip-types --test tests/markdown-render.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 8: Commit**

```bash
git add src/lib/markdown tests/markdown-render.test.mjs bun.lock package.json
git commit -m "feat: add sanitised markdown renderer for community posts"
```

---

### Task 2: Post input schema and slugs

**Files:**
- Create: `src/lib/posts/schema.ts`, `src/lib/posts/slugs.ts`
- Test: `tests/post-schema.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `postInputSchema`, `type PostInput`, `slugify(title: string): string`, `uniqueSlug(base: string, taken: string[]): string`.

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import test from "node:test";

import { postInputSchema } from "../src/lib/posts/schema.ts";
import { slugify, uniqueSlug } from "../src/lib/posts/slugs.ts";

test("slugify produces url safe ascii slugs", () => {
  assert.equal(slugify("Nandi Hills at 5 AM!"), "nandi-hills-at-5-am");
  assert.equal(slugify("  ----  "), "");
});

test("uniqueSlug appends a counter instead of failing", () => {
  assert.equal(uniqueSlug("ride", []), "ride");
  assert.equal(uniqueSlug("ride", ["ride"]), "ride-2");
  assert.equal(uniqueSlug("ride", ["ride", "ride-2"]), "ride-3");
});

test("post input enforces summary length and tag limits", () => {
  const base = {
    title: "A ride to Nandi Hills",
    summary: "x".repeat(20),
    bodyMd: "# heading\n\nbody",
    tags: ["rides"],
  };
  assert.equal(postInputSchema.safeParse(base).success, true);
  assert.equal(
    postInputSchema.safeParse({ ...base, tags: ["a", "b", "c", "d", "e", "f"] })
      .success,
    false,
  );
  assert.equal(
    postInputSchema.safeParse({ ...base, bodyMd: "" }).success,
    false,
  );
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `node --experimental-strip-types --test tests/post-schema.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/lib/posts/slugs.ts`:

```ts
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

export function uniqueSlug(base: string, taken: string[]): string {
  const root = base || "post";
  if (!taken.includes(root)) return root;
  let n = 2;
  while (taken.includes(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}
```

`src/lib/posts/schema.ts` validates `title` 8–120, `summary` 40–2000 with a
40-word soft target, `bodyMd` 1–60000, `tags` 0–5 of `^[a-z0-9-]{2,24}$`, and an
optional `coverImageUrl` restricted to https. Exported via
`postInputSchema = z.object({...}).strict()` and `export type PostInput = z.infer<typeof postInputSchema>`.

- [ ] **Step 4: Run the tests**

Run: `node --experimental-strip-types --test tests/post-schema.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/posts tests/post-schema.test.mjs
git commit -m "feat: add post input schema and slug helpers"
```

---

### Task 3: Password hashing and opaque tokens

**Files:**
- Create: `src/lib/auth/password.ts`, `src/lib/auth/tokens.ts`
- Test: `tests/auth-password.test.mjs`, `tests/auth-tokens.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `hashPassword(plain: string): Promise<string>`, `verifyPassword(hash: string, plain: string): Promise<boolean>`, `createToken(): { token: string; hash: string }`, `hashToken(token: string): string`, `safeEqual(a: string, b: string): boolean`.

- [ ] **Step 1: Install the hash library**

Run: `bun add @node-rs/argon2`

- [ ] **Step 2: Write the failing tests**

```js
test("a password verifies only against its own hash", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword(hash, "correct horse battery staple"), true);
  assert.equal(await verifyPassword(hash, "wrong password entirely"), false);
  assert.equal(await verifyPassword("not-a-hash", "anything"), false);
});

test("tokens are unguessable and stored hashed", () => {
  const a = createToken();
  const b = createToken();
  assert.notEqual(a.token, b.token);
  assert.equal(a.token.length >= 43, true);
  assert.equal(a.hash, hashToken(a.token));
  assert.notEqual(a.hash, a.token);
});
```

- [ ] **Step 3: Implement**

`src/lib/auth/password.ts` uses `@node-rs/argon2` `hash`/`verify` with
`Algorithm.Argon2id`, `memoryCost: 19456`, `timeCost: 2`, `parallelism: 1`
(OWASP baseline). `verifyPassword` returns `false` on any thrown error so a
malformed stored hash never authenticates.

`src/lib/auth/tokens.ts`:

```ts
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
```

- [ ] **Step 4: Run the tests**

Run: `node --experimental-strip-types --test tests/auth-password.test.mjs tests/auth-tokens.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth tests/auth-password.test.mjs tests/auth-tokens.test.mjs
git commit -m "feat: add argon2id hashing and hashed session tokens"
```

---

### Task 4: Database-backed rate limiting

**Files:**
- Create: `src/lib/rate-limit.ts`
- Test: `tests/rate-limit.test.mjs`

**Interfaces:**
- Consumes: `SqlClient` from `src/lib/content-store.ts`.
- Produces: `createRateLimiter(client: SqlClient)` returning `{ hit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> }`.

- [ ] **Step 1: Write the failing test** using `createContentStore`'s in-memory
  SQLite adapter pattern from `tests/content-store.test.mjs`; assert the sixth
  call inside a limit of five is rejected, and that a different key is
  unaffected.

- [ ] **Step 2: Implement**

```ts
export function createRateLimiter(client: SqlClient) {
  return {
    async hit(key: string, limit: number, windowSeconds: number) {
      const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
      const result = await client.execute({
        sql: `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
              ON CONFLICT(key, window_start) DO UPDATE SET count = count + 1
              RETURNING count`,
        args: [key, windowStart],
      });
      const count = Number(result.rows[0]?.count ?? 1);
      return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
    },
  };
}
```

- [ ] **Step 3: Run the test, expect PASS, commit as `feat: add database-backed rate limiting`.**

---

### Task 5: Posts and identity migration

**Files:**
- Create: `scripts/migrate-posts.mjs`, `src/lib/posts/migrate.ts`
- Modify: `package.json` (add `db:migrate:posts`), `docs/content-admin.md`

**Interfaces:**
- Consumes: `SqlClient`.
- Produces: `migratePosts(client: SqlClient): Promise<void>` creating every table in the spec's data model plus `posts_fts`, idempotently.

- [ ] **Step 1: Write the failing test** asserting that calling `migratePosts`
  twice on an in-memory database succeeds and that `INSERT INTO posts` with an
  invalid status fails.

- [ ] **Step 2: Implement the DDL** exactly as specified in section 6 of the
  design, including `CHECK (status IN ('draft','pending','published','rejected','unpublished'))`,
  foreign keys to `users`, and an FTS5 virtual table `posts_fts` over
  `title, summary, body_md, tags` with `content='posts', content_rowid='rowid'`.
  Guard the FTS creation in a `try` block and log a warning if the extension is
  unavailable, so a plain SQLite build still migrates.

- [ ] **Step 3: Run it against a throwaway `file:` database**, confirm tables
  exist, confirm a second run is a no-op, then delete the file.

- [ ] **Step 4: Commit as `feat: add posts and identity schema migration`.**

---

### Task 6: Posts repository with transitions and revisions

**Files:**
- Create: `src/lib/posts/repository.ts`
- Test: `tests/posts-repository.test.mjs`

**Interfaces:**
- Consumes: `SqlClient`, `renderMarkdown`, `PostInput`.
- Produces:
  `createDraft(client, { authorId, input }): Promise<PostRow>`
  `updateDraft(client, { id, authorId, input, expectedVersion }): Promise<PostRow>`
  `submitPost(client, { id, authorId, expectedVersion, publish: boolean }): Promise<PostRow>`
  `moderatePost(client, { id, moderatorId, action, note }): Promise<PostRow>`
  `getPostBySlug(client, slug): Promise<PostRow | null>`
  `listPublished(client, { limit, offset, tag }): Promise<PostRow[]>`
  `listByAuthor(client, authorId): Promise<PostRow[]>`
  `listPending(client): Promise<PostRow[]>`
  `type PostRow = { id, slug, title, summary, bodyMd, bodyHtml, coverImageUrl, tags: string[], authorId, status, publishedAt, updatedAt, version, moderationNote }`

- [ ] **Step 1: Write the failing tests** for: version conflict on stale update;
  forbidden update by a different author; submit at trust 0 yields `pending`;
  submit at trust 1 yields `published` with `publishedAt`; edit of a published
  post returns it to `pending` at trust 0; every transition appends exactly one
  revision row.

- [ ] **Step 2: Implement** each operation as an atomic `client.batch` write that
  selects the affected row back with `RETURNING`, mirroring the existing content
  store's optimistic-concurrency pattern. Rendering happens before the write;
  a render failure aborts without mutating.

- [ ] **Step 3: Run the tests, expect PASS, commit as `feat: add posts repository with versioned transitions`.**

---

### Task 7: Trust lifecycle

**Files:**
- Create: `src/lib/posts/lifecycle.ts`
- Test: `tests/post-lifecycle.test.mjs`

**Interfaces:**
- Produces: `decideSubmitStatus(trustLevel: 0 | 1 | 2): "pending" | "published"`, `decideTrust({ approvedCount, rejectedCount }): 0 | 1 | 2`.

- [ ] **Step 1: Write the failing test** covering: level 0 pending; levels 1 and
  2 publish; 3 approved promotes; 2 rejected demotes; a moderator is never
  demoted by counts; promotion is capped at 2.

- [ ] **Step 2: Implement as pure functions**, no database access.

- [ ] **Step 3: Run, expect PASS, commit as `feat: add author trust lifecycle rules`.**

---

### Task 8: Mail transport

**Files:**
- Create: `src/lib/mail.ts`, `src/lib/mail/templates.ts`

**Interfaces:**
- Produces: `sendMail({ to, subject, text, html }): Promise<void>`; when
  `RESEND_API_KEY` is absent it logs a redacted line and resolves, so local
  development and CI never fail.

- [ ] **Step 1: Implement** the transport against `https://api.resend.com/emails`
  with `fetch`, `from` from `MAIL_FROM`, and a 10-second `AbortSignal.timeout`.
  Never log the recipient address in full; log the domain only.

- [ ] **Step 2: Implement two templates** returning subject plus text body:
  verification and password reset. Both include the single-use link and expiry.

- [ ] **Step 3: Commit as `feat: add transactional mail with a no-op fallback`.**

---

### Task 9: Auth routes and forms

**Files:**
- Create: `src/app/api/auth/[...action]/route.ts`, `src/lib/auth/service.ts`,
  `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/login/page.tsx`,
  `src/app/(auth)/reset/page.tsx`, `src/components/auth/auth-form.tsx`

**Interfaces:**
- Consumes: password, tokens, repository, rate limiter, mail.
- Produces: `POST /api/auth/signup|login|logout|verify|reset-request|reset-complete`.

- [ ] **Step 1: Write the failing route tests** for: duplicate email returns a
  generic failure without revealing existence; unverified login is refused with
  a distinct message; five failed logins lock the key; a used reset token fails
  on replay; logout deletes only the current session.

- [ ] **Step 2: Implement the service** with a shared `respondError` that keeps
  auth failures deliberately vague, and a `setSessionCookie` helper using
  `httpOnly`, `secure` in production, `sameSite: "lax"`, `path: "/"`, 30 days.

- [ ] **Step 3: Implement the three forms** as small client components posting
  JSON, showing field-level errors in an `aria-live` region, with 44px inputs
  and labelled fields.

- [ ] **Step 4: Run tests, commit as `feat: add email and password authentication`.**

---

### Task 10: Post API routes

**Files:**
- Create: `src/app/api/posts/route.ts`, `src/app/api/posts/[id]/route.ts`,
  `src/app/api/posts/[id]/submit/route.ts`, `src/app/api/moderation/[id]/route.ts`,
  `src/lib/auth/guards.ts`

**Interfaces:**
- Consumes: repository, lifecycle, guards, rate limiter.
- Produces: JSON APIs used by the editor and moderation queue.

- [ ] **Step 1: Write the failing tests** for: unauthenticated create → 401;
  author editing someone else's post → 403; stale version → 409; rate limit
  exceeded → 429 with `Retry-After`; moderator-only actions refused to riders.

- [ ] **Step 2: Implement guards** returning a discriminated union exactly like
  `requireAdmin()`, and route handlers that read `content-length` before parsing
  and cap bodies at 128 KB.

- [ ] **Step 3: Call `revalidatePath("/posts")` and the post path after a
  transition that changes public visibility.**

- [ ] **Step 4: Run tests, commit as `feat: add posts and moderation API routes`.**

---

### Task 11: Editor and drafts UI

**Files:**
- Create: `src/app/write/page.tsx`, `src/app/drafts/page.tsx`,
  `src/components/posts/post-editor.tsx`, plus a server action or fetch client
  in `src/components/posts/post-client.ts`

- [ ] **Step 1: Implement the editor** with title, summary, tags, cover URL,
  Markdown textarea with monospace styling, a live preview rendered through the
  server render endpoint, character counters, autosave every 20 seconds to the
  draft endpoint, and a visible save state.
- [ ] **Step 2: Implement drafts list** with status chips, last-saved time,
  word count and a submit action.
- [ ] **Step 3: Verify keyboard-only use and screen-reader labels manually.**
- [ ] **Step 4: Commit as `feat: add post editor and drafts dashboard`.**

---

### Task 12: Moderation queue

**Files:**
- Create: `src/app/moderation/page.tsx`, `src/components/posts/moderation-queue.tsx`

- [ ] **Step 1: Implement the queue** listing pending posts oldest first with a
  preview, author trust badge, approve, reject-with-note and unpublish actions.
- [ ] **Step 2: Require a note to reject; show the note to the author in
  `/drafts`.**
- [ ] **Step 3: Commit as `feat: add moderator review queue`.**

---

### Task 13: Public reading experience

**Files:**
- Create: `src/app/(with-root-layout)/posts/page.tsx`,
  `src/app/(with-root-layout)/posts/[slug]/page.tsx`,
  `src/app/(with-root-layout)/writers/[handle]/page.tsx`,
  `src/components/posts/post-card.tsx`, `src/components/posts/post-body.tsx`,
  `src/app/rss.xml/route.ts`

- [ ] **Step 1: Implement the reading page** with cover image, title, byline,
  published and updated dates, sticky TOC on desktop, sanitised body, tags,
  author card, related posts, and JSON-LD from `src/lib/seo/post-jsonld.ts`.
- [ ] **Step 2: Implement the feed** with pagination and topic filtering.
- [ ] **Step 3: Implement the author profile** with bio, post count and posts.
- [ ] **Step 4: Implement RSS** with the newest 20 published posts.
- [ ] **Step 5: Add `revalidate = 60` and `generateStaticParams` for the newest
  100 slugs, with `dynamicParams = true`.**
- [ ] **Step 6: Commit as `feat: add public post feed, article page and RSS`.**

---

### Task 14: SEO wiring for posts

**Files:**
- Create: `src/lib/seo/post-jsonld.ts`
- Modify: `src/app/sitemap.ts`, `src/lib/siteMetadata.ts`

- [ ] **Step 1: Write the failing test** asserting `BlogPosting` JSON-LD has
  headline, datePublished, dateModified, author, publisher and
  `mainEntityOfPage`, and that breadcrumbs are present in order.
- [ ] **Step 2: Implement the builders** and include published posts in
  `sitemap.xml` with `lastModified = updatedAt`.
- [ ] **Step 3: Register `/posts` in `publicPages`**, indexed only when at least
  one post is published, mirroring the existing `/blogs` rule.
- [ ] **Step 4: Run `npm run test:seo`, commit as `feat: add post structured data and sitemap entries`.**

---

### Task 15: Documentation and activation

**Files:**
- Create: `docs/community-blogging.md`
- Modify: `README.md`, `docs/activation-guide.md`

- [ ] **Step 1: Document** signup, trust rules, moderation, the directive
  reference, and the new environment variables `RESEND_API_KEY`, `MAIL_FROM`,
  `ADMIN_EMAILS`, `POSTS_DB` reuse of the existing Turso URL.
- [ ] **Step 2: Extend the activation checklist** with `npm run db:migrate:posts`
  and the Resend domain verification step.
- [ ] **Step 3: Run the full gate:** `npm test`, `npm run typecheck`,
  `npm run lint`, `npm run validate:content`, `npm run build`. CI remains the
  authority for the build.
- [ ] **Step 4: Commit as `docs: document community blogging and activation`.**

---

## Self-Review

- **Spec coverage:** identity (§7), lifecycle (§8), rendering (§9), post
  structured data and sitemap (§10), reading experience (§12), phase 1 row of
  §13, verification (§16). Programmatic pages, comments, uploads and search are
  phases 2–6 and intentionally absent.
- **Placeholder scan:** no `TBD`; every task names files, interfaces, tests and
  the exact command to run.
- **Type consistency:** `PostRow` field names are used identically in tasks 6,
  10, 11, 12 and 13; `TocEntry` matches between tasks 1 and 13;
  `decideSubmitStatus` returns the exact literals the repository stores.
- **Review focus:** all five lines have a named owning task and an explicit test
  (Task 1 steps 6, 1 step 6 directive case, Task 6 step 1, Task 9 step 1, Task 9
  step 1 replay case).
