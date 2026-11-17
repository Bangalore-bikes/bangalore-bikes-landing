import { randomUUID } from "node:crypto";

import type { SqlClient, SqlResult, SqlStatement, SqlValue } from "../content-store.ts";
import { renderMarkdown } from "../markdown/render.ts";
import { decideSubmitStatus, type TrustLevel } from "./lifecycle.ts";
import { postInputSchema, type PostInput, type PostStatus } from "./schema.ts";
import { slugify, uniqueSlug } from "./slugs.ts";

export type PostAuthor = {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
};

export type PostRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  bodyMd: string;
  bodyHtml: string | null;
  coverImageUrl: string | null;
  tags: string[];
  authorId: string;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  moderationNote: string | null;
  author: PostAuthor | null;
};

export type PostErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "CONFLICT"
  | "BAD_STATE"
  | "NOTE_REQUIRED";

export class PostError extends Error {
  readonly code: PostErrorCode;
  constructor(code: PostErrorCode, message: string) {
    super(message);
    this.name = "PostError";
    this.code = code;
  }
}

export type ModerationAction = "approve" | "reject" | "unpublish";

const statement = (sql: string, args: SqlValue[] = []): SqlStatement => ({ sql, args });

const COLUMNS = `p.id, p.slug, p.title, p.summary, p.body_md, p.body_html,
  p.cover_image_url, p.tags, p.author_id, p.status, p.published_at,
  p.created_at, p.updated_at, p.version, p.moderation_note`;

/**
 * The same decision table as `decideTrust`, expressed once in SQL so a
 * moderation action can update counts and trust in one transaction. A test runs
 * this exact expression over a matrix of counts and compares it with the pure
 * function, so the two cannot drift apart unnoticed.
 */
export const TRUST_LEVEL_SQL = `CASE
  WHEN role = 'moderator' THEN 2
  WHEN rejected_count >= 2 THEN 0
  WHEN approved_count >= 10 THEN 2
  WHEN approved_count >= 3 THEN 1
  ELSE 0 END`;

function nowIso(): string {
  return new Date().toISOString();
}

function tagsOf(value: unknown): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

function toPost(row: SqlResult["rows"][number], author: PostAuthor | null = null): PostRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    summary: String(row.summary),
    bodyMd: String(row.body_md),
    bodyHtml: row.body_html === null || row.body_html === undefined ? null : String(row.body_html),
    coverImageUrl:
      row.cover_image_url === null || row.cover_image_url === undefined
        ? null
        : String(row.cover_image_url),
    tags: tagsOf(row.tags),
    authorId: String(row.author_id),
    status: String(row.status) as PostStatus,
    publishedAt: row.published_at == null ? null : String(row.published_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    version: Number(row.version),
    moderationNote:
      row.moderation_note === null || row.moderation_note === undefined
        ? null
        : String(row.moderation_note),
    author,
  };
}

function authorOf(row: SqlResult["rows"][number]): PostAuthor | null {
  const handle = row.author_handle;
  if (typeof handle !== "string") return null;
  return {
    id: String(row.author_id),
    handle,
    displayName: String(row.author_display_name ?? handle),
    avatarUrl: row.author_avatar_url == null ? null : String(row.author_avatar_url),
  };
}

function invalid(message: string): never {
  throw new PostError("INVALID_INPUT", message);
}

function validateInput(input: PostInput): PostInput {
  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) {
    invalid(parsed.error.issues[0]?.message ?? "The post could not be validated");
  }
  return parsed.data;
}

function searchText(input: PostInput): string {
  return [input.title, input.summary, input.tags.join(" "), input.bodyMd].join("\n");
}

/**
 * Slugs are permanent for published posts, so a collision is resolved with a
 * numeric suffix rather than silently replacing another author's URL.
 */
async function allocateSlug(
  client: SqlClient,
  input: PostInput,
): Promise<string> {
  const base = (input.slug ? slugify(input.slug) : slugify(input.title)) || "post";
  const taken = await client.execute({
    sql: "SELECT slug FROM posts WHERE slug = ? OR slug LIKE ?",
    args: [base, `${base}-%`],
  });
  return uniqueSlug(
    base,
    taken.rows.map((row) => String(row.slug)),
  );
}

/**
 * Revision and audit rows are keyed to the version the write produced, so a
 * statement that failed to apply cannot leave an orphaned history entry.
 */
function historyStatements(
  postId: string,
  version: number,
  actorId: string,
  createdAt: string,
  auditAction: string,
): SqlStatement[] {
  return [
    statement(
      `INSERT INTO post_revisions (id, post_id, version, title, summary, body_md, editor_id, created_at)
       SELECT ?, id, version, title, summary, body_md, ?, ?
       FROM posts WHERE id = ? AND version = ?`,
      [randomUUID(), actorId, createdAt, postId, version],
    ),
    statement(
      `INSERT INTO content_audit (collection, record_id, actor, action, version)
       SELECT 'posts', id, ?, ?, version FROM posts WHERE id = ? AND version = ?`,
      [actorId, auditAction, postId, version],
    ),
  ];
}

/**
 * Counts and trust only move when the moderation statement actually changed a
 * row: `changes()` reads the previous statement in the same transaction.
 */
function trustStatements(
  userId: string,
  approved: number,
  rejected: number,
): SqlStatement[] {
  const statements: SqlStatement[] = [];
  if (approved) {
    statements.push(
      statement(
        `UPDATE users SET approved_count = approved_count + 1
         WHERE id = ? AND changes() > 0`,
        [userId],
      ),
    );
  }
  if (rejected) {
    statements.push(
      statement(
        `UPDATE users SET rejected_count = rejected_count + 1
         WHERE id = ? AND changes() > 0`,
        [userId],
      ),
    );
  }
  if (statements.length) {
    statements.push(
      statement(
        `UPDATE users SET trust_level = ${TRUST_LEVEL_SQL}
         WHERE id = ? AND changes() > 0`,
        [userId],
      ),
    );
  }
  return statements;
}

type CurrentPost = {
  id: string;
  authorId: string;
  status: PostStatus;
  version: number;
  publishedAt: string | null;
  trustLevel: TrustLevel;
  role: string;
};

async function loadCurrent(client: SqlClient, id: string): Promise<CurrentPost | null> {
  const result = await client.execute(
    statement(
      `SELECT p.id, p.author_id, p.status, p.version, p.published_at,
              u.trust_level, u.role
       FROM posts p JOIN users u ON u.id = p.author_id WHERE p.id = ?`,
      [id],
    ),
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    authorId: String(row.author_id),
    status: String(row.status) as PostStatus,
    version: Number(row.version),
    publishedAt: row.published_at == null ? null : String(row.published_at),
    trustLevel: Number(row.trust_level) as TrustLevel,
    role: String(row.role),
  };
}

/**
 * Editing must never quietly publish something a reader could not see before.
 * A draft stays a draft; anything already visible re-enters the review path
 * decided by the author's trust level.
 */
function statusAfterEdit(current: PostStatus, trustLevel: TrustLevel): PostStatus {
  if (current === "draft" || current === "rejected") return "draft";
  if (current === "pending") return "pending";
  return decideSubmitStatus(trustLevel);
}

async function write(client: SqlClient, statements: SqlStatement[]) {
  try {
    return await client.batch(statements, "write");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/UNIQUE constraint failed: posts\.slug/i.test(message)) {
      throw new PostError("CONFLICT", "That slug was claimed while saving; try again");
    }
    throw error;
  }
}

export async function createDraft(
  client: SqlClient,
  options: { authorId: string; input: PostInput },
): Promise<PostRow> {
  if (!options.authorId?.trim()) invalid("An author is required");
  const input = validateInput(options.input);
  const rendered = await renderMarkdown(input.bodyMd);
  const slug = await allocateSlug(client, input);
  const now = nowIso();
  const id = randomUUID();

  const results = await write(client, [
    statement(
      `INSERT INTO posts (id, slug, title, summary, body_md, body_html, cover_image_url,
        tags, author_id, status, published_at, created_at, updated_at, version,
        moderation_note, search_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NULL, ?, ?, 1, NULL, ?)
       RETURNING *`,
      [
        id,
        slug,
        input.title,
        input.summary,
        input.bodyMd,
        rendered.html,
        input.coverImageUrl ?? null,
        JSON.stringify(input.tags),
        options.authorId,
        now,
        now,
        searchText(input),
      ],
    ),
    ...historyStatements(id, 1, options.authorId, now, "create"),
  ]);

  const row = results[0].rows[0];
  if (!row) throw new PostError("CONFLICT", "The post could not be created");
  return toPost(row);
}

export async function updateDraft(
  client: SqlClient,
  options: {
    id: string;
    authorId: string;
    input: PostInput;
    expectedVersion: number;
  },
): Promise<PostRow> {
  if (!options.id?.trim()) invalid("A post id is required");
  if (!options.authorId?.trim()) invalid("An author is required");
  if (!Number.isSafeInteger(options.expectedVersion) || options.expectedVersion < 1) {
    invalid("Expected version must be a positive integer");
  }
  const input = validateInput(options.input);
  const current = await loadCurrent(client, options.id);
  if (!current) throw new PostError("NOT_FOUND", "Post not found");
  if (current.authorId !== options.authorId) {
    throw new PostError("FORBIDDEN", "Only the author can edit this post");
  }
  if (current.version !== options.expectedVersion) {
    throw new PostError("CONFLICT", "This post changed elsewhere; reload before saving");
  }

  const rendered = await renderMarkdown(input.bodyMd);
  const status = statusAfterEdit(current.status, current.trustLevel);
  const now = nowIso();
  const publishedAt =
    status === "published" ? (current.publishedAt ?? now) : current.publishedAt;

  const results = await write(client, [
    statement(
      `UPDATE posts SET title = ?, summary = ?, body_md = ?, body_html = ?,
        cover_image_url = ?, tags = ?, status = ?, published_at = ?, updated_at = ?,
        search_text = ?, version = version + 1
       WHERE id = ? AND author_id = ? AND version = ?
       RETURNING *`,
      [
        input.title,
        input.summary,
        input.bodyMd,
        rendered.html,
        input.coverImageUrl ?? null,
        JSON.stringify(input.tags),
        status,
        publishedAt,
        now,
        searchText(input),
        options.id,
        options.authorId,
        options.expectedVersion,
      ],
    ),
    ...historyStatements(options.id, options.expectedVersion + 1, options.authorId, now, "update"),
  ]);

  const row = results[0].rows[0];
  if (!row) throw new PostError("CONFLICT", "This post changed elsewhere; reload before saving");
  return toPost(row);
}

export async function submitPost(
  client: SqlClient,
  options: {
    id: string;
    authorId: string;
    expectedVersion: number;
    publish: boolean;
  },
): Promise<PostRow> {
  if (!options.id?.trim()) invalid("A post id is required");
  const current = await loadCurrent(client, options.id);
  if (!current) throw new PostError("NOT_FOUND", "Post not found");
  if (current.authorId !== options.authorId) {
    throw new PostError("FORBIDDEN", "Only the author can submit this post");
  }
  if (current.version !== options.expectedVersion) {
    throw new PostError("CONFLICT", "This post changed elsewhere; reload before submitting");
  }
  if (current.status === "published") {
    throw new PostError("BAD_STATE", "This post is already published; edit it instead");
  }

  // Re-render from the stored source: the draft's HTML may predate a fix.
  const stored = await client.execute(
    statement("SELECT body_md FROM posts WHERE id = ?", [options.id]),
  );
  const bodyMd = String(stored.rows[0]?.body_md ?? "");
  const rendered = await renderMarkdown(bodyMd);

  const status: PostStatus = options.publish
    ? decideSubmitStatus(current.trustLevel)
    : "draft";
  const now = nowIso();
  const publishedAt =
    status === "published" ? (current.publishedAt ?? now) : current.publishedAt;

  const results = await write(client, [
    statement(
      `UPDATE posts SET body_html = ?, status = ?, published_at = ?,
        moderation_note = NULL, updated_at = ?, version = version + 1
       WHERE id = ? AND author_id = ? AND version = ? AND status <> 'published'
       RETURNING *`,
      [
        rendered.html,
        status,
        publishedAt,
        now,
        options.id,
        options.authorId,
        options.expectedVersion,
      ],
    ),
    ...historyStatements(
      options.id,
      options.expectedVersion + 1,
      options.authorId,
      now,
      options.publish ? "submit" : "update",
    ),
  ]);

  const row = results[0].rows[0];
  if (!row) throw new PostError("CONFLICT", "This post changed elsewhere; reload before submitting");
  return toPost(row);
}

const TRANSITIONS: Record<ModerationAction, { from: PostStatus; to: PostStatus }> = {
  approve: { from: "pending", to: "published" },
  reject: { from: "pending", to: "rejected" },
  unpublish: { from: "published", to: "unpublished" },
};

export async function moderatePost(
  client: SqlClient,
  options: {
    id: string;
    moderatorId: string;
    action: ModerationAction;
    note?: string | null;
  },
): Promise<PostRow> {
  if (!options.id?.trim()) invalid("A post id is required");
  if (!options.moderatorId?.trim()) invalid("A moderator is required");
  const transition = TRANSITIONS[options.action];
  if (!transition) invalid("Unknown moderation action");

  const note = options.note?.trim() ? options.note.trim().slice(0, 2000) : null;
  if (options.action === "reject" && !note) {
    throw new PostError("NOTE_REQUIRED", "Explain what needs to change before rejecting");
  }

  const current = await loadCurrent(client, options.id);
  if (!current) throw new PostError("NOT_FOUND", "Post not found");
  if (current.status !== transition.from) {
    throw new PostError(
      "BAD_STATE",
      `Only a ${transition.from} post can be ${options.action}d`,
    );
  }

  const now = nowIso();
  const publishedAt =
    transition.to === "published" ? (current.publishedAt ?? now) : current.publishedAt;
  const nextVersion = current.version + 1;

  const results = await write(client, [
    statement(
      `UPDATE posts SET status = ?, moderation_note = ?, published_at = ?,
        updated_at = ?, version = version + 1
       WHERE id = ? AND version = ? AND status = ?
       RETURNING *`,
      [
        transition.to,
        note,
        publishedAt,
        now,
        options.id,
        current.version,
        transition.from,
      ],
    ),
    ...trustStatements(
      current.authorId,
      options.action === "approve" ? 1 : 0,
      options.action === "reject" ? 1 : 0,
    ),
    ...historyStatements(options.id, nextVersion, options.moderatorId, now, options.action),
  ]);

  const row = results[0].rows[0];
  if (!row) throw new PostError("CONFLICT", "This post changed elsewhere; reload the queue");
  return toPost(row);
}

const READ_SELECT = `SELECT ${COLUMNS}, u.handle AS author_handle,
    u.display_name AS author_display_name, u.avatar_url AS author_avatar_url,
    p.author_id AS author_id
  FROM posts p JOIN users u ON u.id = p.author_id`;

export async function getPostById(
  client: SqlClient,
  id: string,
): Promise<PostRow | null> {
  if (!id?.trim()) invalid("A post id is required");
  const result = await client.execute(
    statement(`${READ_SELECT} WHERE p.id = ?`, [id]),
  );
  const row = result.rows[0];
  return row ? toPost(row, authorOf(row)) : null;
}

export async function getPostBySlug(
  client: SqlClient,
  slug: string,
  options: { publishedOnly?: boolean } = {},
): Promise<PostRow | null> {
  if (!slug?.trim()) invalid("A slug is required");
  const publishedOnly = options.publishedOnly ?? true;
  const result = await client.execute(
    statement(
      `${READ_SELECT} WHERE p.slug = ?${publishedOnly ? " AND p.status = 'published'" : ""}`,
      [slug],
    ),
  );
  const row = result.rows[0];
  return row ? toPost(row, authorOf(row)) : null;
}

export async function listPublished(
  client: SqlClient,
  options: { limit?: number; offset?: number; tag?: string } = {},
): Promise<PostRow[]> {
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    invalid("Limit must be between 1 and 100");
  }
  if (!Number.isSafeInteger(offset) || offset < 0) invalid("Offset must not be negative");

  const tag = options.tag?.trim();
  const result = await client.execute(
    statement(
      `${READ_SELECT}
       WHERE p.status = 'published'
         ${tag ? "AND EXISTS (SELECT 1 FROM json_each(p.tags) WHERE value = ?)" : ""}
       ORDER BY p.published_at DESC, p.id DESC
       LIMIT ? OFFSET ?`,
      tag ? [tag, limit, offset] : [limit, offset],
    ),
  );
  return result.rows.map((row) => toPost(row, authorOf(row)));
}

export async function listByAuthor(
  client: SqlClient,
  authorId: string,
  options: { publishedOnly?: boolean } = {},
): Promise<PostRow[]> {
  if (!authorId?.trim()) invalid("An author is required");
  const result = await client.execute(
    statement(
      `${READ_SELECT} WHERE p.author_id = ?
         ${options.publishedOnly ? "AND p.status = 'published'" : ""}
       ORDER BY p.updated_at DESC, p.id DESC`,
      [authorId],
    ),
  );
  return result.rows.map((row) => toPost(row, authorOf(row)));
}

export async function listPending(client: SqlClient): Promise<PostRow[]> {
  const result = await client.execute(
    statement(
      `${READ_SELECT} WHERE p.status = 'pending'
       ORDER BY p.updated_at ASC, p.id ASC LIMIT 200`,
    ),
  );
  return result.rows.map((row) => toPost(row, authorOf(row)));
}

export async function listRevisions(
  client: SqlClient,
  postId: string,
): Promise<Array<{ version: number; title: string; editorId: string; createdAt: string }>> {
  if (!postId?.trim()) invalid("A post id is required");
  const result = await client.execute(
    statement(
      `SELECT version, title, editor_id, created_at FROM post_revisions
       WHERE post_id = ? ORDER BY version DESC`,
      [postId],
    ),
  );
  return result.rows.map((row) => ({
    version: Number(row.version),
    title: String(row.title),
    editorId: String(row.editor_id),
    createdAt: String(row.created_at),
  }));
}
