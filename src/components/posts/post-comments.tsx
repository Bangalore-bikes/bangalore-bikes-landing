"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; handle: string; displayName: string };
};
type Viewer = { id: string; role: string } | null;

const MAX = 1000;

function when(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

export function PostComments({ postId, slug }: { postId: string; slug: string }) {
  const endpoint = `/api/posts/${postId}/comments`;
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();
      setComments(data.comments ?? []);
      setViewer(data.viewer ?? null);
    } catch {
      setComments([]);
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  async function send(url: string, init: RequestInit) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(url, init);
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "Something went wrong. Try again.");
        return false;
      }
      setComments(data.comments ?? []);
      return true;
    } catch {
      setError("Could not reach the server. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    const ok = await send(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (ok) setText("");
  }

  return (
    <section aria-labelledby="comments-title" className="mt-14 border-t border-border pt-10">
      <h2 id="comments-title" className="text-2xl font-semibold tracking-tight">
        Comments{comments && comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {comments === null ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No comments yet. Start the conversation.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-x-3 text-sm">
                <Link
                  href={`/writers/${comment.author.handle}`}
                  className="font-medium hover:underline"
                >
                  {comment.author.displayName}
                </Link>
                <time className="text-muted-foreground" dateTime={comment.createdAt}>
                  {when(comment.createdAt)}
                </time>
                {viewer && (viewer.id === comment.author.id || viewer.role === "moderator") && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void send(`${endpoint}?commentId=${encodeURIComponent(comment.id)}`, {
                        method: "DELETE",
                      })
                    }
                    className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}

      {viewer ? (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <label htmlFor="comment-body" className="text-sm font-medium">
            Add a comment
          </label>
          <textarea
            id="comment-body"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={MAX}
            rows={4}
            className="w-full rounded-lg border border-border bg-background p-3 outline-none focus-visible:ring-2 focus-visible:ring-dixie"
            placeholder="Share a tip, a question or how your ride went"
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">
              {text.length}/{MAX} · plain text only
            </span>
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="min-h-11 rounded-md bg-dixie px-5 font-semibold text-black transition-opacity disabled:opacity-50"
            >
              {busy ? "Posting…" : "Post comment"}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-border p-5 text-muted-foreground">
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            href={`/login?next=${encodeURIComponent(`/posts/${slug}`)}`}
          >
            Log in
          </Link>{" "}
          or{" "}
          <Link className="font-medium text-foreground underline underline-offset-4" href="/signup">
            create an account
          </Link>{" "}
          to comment.
        </p>
      )}
    </section>
  );
}
