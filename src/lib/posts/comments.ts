import { randomUUID } from "node:crypto";

import type { SqlClient } from "../content-store.ts";

export const MAX_COMMENT_LENGTH = 1000;

export type CommentRow = {
  id: string;
  postId: string;
  body: string;
  createdAt: string;
  author: { id: string; handle: string; displayName: string; avatarUrl: string | null };
};

export class CommentError extends Error {
  readonly code: "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN";
  constructor(code: "INVALID_INPUT" | "NOT_FOUND" | "FORBIDDEN", message: string) {
    super(message);
    this.code = code;
  }
}

/** Comments are plain text, never HTML, so there is nothing to sanitise on the way out. */
export function cleanComment(value: unknown): string {
  if (typeof value !== "string") {
    throw new CommentError("INVALID_INPUT", "Write a comment first");
  }
  const text = value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length === 0) throw new CommentError("INVALID_INPUT", "Write a comment first");
  if (text.length > MAX_COMMENT_LENGTH) {
    throw new CommentError(
      "INVALID_INPUT",
      `Keep comments under ${MAX_COMMENT_LENGTH} characters`,
    );
  }
  return text;
}

export async function listComments(client: SqlClient, postId: string): Promise<CommentRow[]> {
  const result = await client.execute({
    sql: `SELECT c.id, c.post_id, c.body_md, c.created_at,
                 u.id AS author_id, u.handle, u.display_name, u.avatar_url
          FROM post_comments c
          JOIN users u ON u.id = c.author_id
          WHERE c.post_id = ? AND c.status = 'published' AND c.deleted_at IS NULL
                AND u.disabled_at IS NULL
          ORDER BY c.created_at ASC
          LIMIT 200`,
    args: [postId],
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    postId: String(row.post_id),
    body: String(row.body_md),
    createdAt: String(row.created_at),
    author: {
      id: String(row.author_id),
      handle: String(row.handle),
      displayName: String(row.display_name),
      avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    },
  }));
}

export async function addComment(
  client: SqlClient,
  input: { postId: string; authorId: string; body: unknown },
): Promise<string> {
  const body = cleanComment(input.body);
  const post = await client.execute({
    sql: "SELECT id FROM posts WHERE id = ? AND status = 'published'",
    args: [input.postId],
  });
  if (post.rows.length === 0) throw new CommentError("NOT_FOUND", "Post not found");

  const id = randomUUID();
  await client.execute({
    sql: `INSERT INTO post_comments (id, post_id, author_id, body_md, status, created_at)
          VALUES (?, ?, ?, ?, 'published', ?)`,
    args: [id, input.postId, input.authorId, body, new Date().toISOString()],
  });
  return id;
}

/** The author may remove their own comment; a moderator may remove any. */
export async function deleteComment(
  client: SqlClient,
  input: { commentId: string; user: { id: string; role: string } },
): Promise<void> {
  const found = await client.execute({
    sql: "SELECT author_id FROM post_comments WHERE id = ? AND deleted_at IS NULL",
    args: [input.commentId],
  });
  const row = found.rows[0];
  if (!row) throw new CommentError("NOT_FOUND", "Comment not found");
  if (String(row.author_id) !== input.user.id && input.user.role !== "moderator") {
    throw new CommentError("FORBIDDEN", "You can only remove your own comments");
  }
  await client.execute({
    sql: "UPDATE post_comments SET deleted_at = ? WHERE id = ?",
    args: [new Date().toISOString(), input.commentId],
  });
}
