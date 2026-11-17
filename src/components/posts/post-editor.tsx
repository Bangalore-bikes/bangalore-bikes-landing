"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type EditablePost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  bodyMd: string;
  tags: string[];
  coverImageUrl: string | null;
  version: number;
  status: string;
};

type ApiBody = { message?: string; issues?: string[]; post?: EditablePost };

const BODY_LIMIT = 60_000;

function messageOf(data: ApiBody, fallback: string): string {
  if (data.issues?.length) return data.issues.join(". ");
  return data.message ?? fallback;
}

export function PostEditor({ post }: { post?: EditablePost }) {
  const router = useRouter();
  const [postId, setPostId] = useState(post?.id ?? "");
  const [version, setVersion] = useState(post?.version ?? 0);
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [bodyMd, setBodyMd] = useState(post?.bodyMd ?? "");
  const [tagText, setTagText] = useState((post?.tags ?? []).join(", "));
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");

  const [html, setHtml] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  const saveRef = useRef<(autosave?: boolean) => Promise<EditablePost | null>>(async () => null);

  const payload = useCallback(() => {
    const tags = tagText
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);
    return {
      title: title.trim(),
      summary: summary.trim(),
      bodyMd,
      tags,
      ...(coverImageUrl.trim() ? { coverImageUrl: coverImageUrl.trim() } : {}),
    };
  }, [title, summary, bodyMd, tagText, coverImageUrl]);

  const save = useCallback(
    async (autosave = false): Promise<EditablePost | null> => {
      if (autosave && (!postId || !dirty)) return null;
      setBusy(!autosave);
      if (!autosave) setError("");
      setStatus(autosave ? "Saving…" : "Saving…");
      try {
        const response = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
          method: postId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postId ? { ...payload(), expectedVersion: version } : payload()),
        });
        const data = (await response.json().catch(() => ({}))) as ApiBody;
        if (!response.ok || !data.post) {
          setStatus("");
          setError(messageOf(data, "The draft could not be saved"));
          return null;
        }
        setPostId(data.post.id);
        setVersion(data.post.version);
        setSlug(data.post.slug);
        setDirty(false);
        setStatus(
          `Saved ${new Intl.DateTimeFormat("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
          }).format(new Date())}`,
        );
        return data.post;
      } catch {
        setStatus("");
        setError("The network dropped the save. Your text is still here.");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [dirty, payload, postId, version],
  );

  saveRef.current = save;

  useEffect(() => {
    const timer = setInterval(() => {
      void saveRef.current(true);
    }, 20_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!bodyMd.trim()) {
        setHtml("");
        return;
      }
      fetch("/api/posts/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyMd }),
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { html?: string } | null) => {
          if (!cancelled && data?.html) setHtml(data.html);
        })
        .catch(() => undefined);
    }, 700);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bodyMd]);

  async function submit() {
    setError("");
    const saved = await save();
    if (!saved) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/posts/${saved.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedVersion: saved.version, publish: true }),
      });
      const data = (await response.json().catch(() => ({}))) as ApiBody;
      if (!response.ok || !data.post) {
        setError(messageOf(data, "The post could not be submitted"));
        return;
      }
      router.push(data.post.status === "published" ? `/posts/${data.post.slug}` : "/drafts");
      router.refresh();
    } catch {
      setError("The network dropped the submission. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const words = bodyMd.trim() ? bodyMd.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {postId ? "Edit post" : "New post"}
          </h1>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {status || (dirty ? "Unsaved changes" : "Markdown, saved to your drafts")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={busy}
            onClick={() => void save()}
          >
            Save draft
          </Button>
          <Button type="button" className="h-11" disabled={busy} onClick={() => void submit()}>
            Submit for review
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="title">Title</Label>
              <span className="text-xs text-muted-foreground">{title.trim().length}/120</span>
            </div>
            <Input
              id="title"
              className="h-11"
              value={title}
              maxLength={120}
              required
              onChange={(event) => {
                setTitle(event.target.value);
                setDirty(true);
              }}
              placeholder="Nandi Hills before sunrise"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="summary">Summary</Label>
              <span className="text-xs text-muted-foreground">
                {summary.trim().length} characters, 40 minimum
              </span>
            </div>
            <Textarea
              id="summary"
              value={summary}
              rows={3}
              maxLength={2000}
              onChange={(event) => {
                setSummary(event.target.value);
                setDirty(true);
              }}
              placeholder="Two sentences that answer what this is and who it is for. This becomes the TL;DR and the search description."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover image URL</Label>
            <Input
              id="cover"
              className="h-11"
              value={coverImageUrl}
              onChange={(event) => {
                setCoverImageUrl(event.target.value);
                setDirty(true);
              }}
              placeholder="https://…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              className="h-11"
              value={tagText}
              onChange={(event) => {
                setTagText(event.target.value);
                setDirty(true);
              }}
              placeholder="rides, nandi-hills"
            />
            <p className="text-xs text-muted-foreground">
              Comma separated, up to five. Lowercase letters, numbers and dashes.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="body">Body</Label>
              <span className="text-xs text-muted-foreground">
                {bodyMd.length.toLocaleString("en-IN")}/{BODY_LIMIT.toLocaleString("en-IN")} ·{" "}
                {words} words
              </span>
            </div>
            <Textarea
              id="body"
              value={bodyMd}
              rows={20}
              maxLength={BODY_LIMIT}
              className="font-mono text-sm leading-6"
              onChange={(event) => {
                setBodyMd(event.target.value);
                setDirty(true);
              }}
              placeholder={"## The start\n\nWe rolled out of Hebbal at five.\n\n:::callout{type=tip}\nCarry a light.\n:::"}
            />
          </div>
        </div>

        <aside aria-label="Preview" className="space-y-2">
          <p className="text-sm font-medium">Preview</p>
          <div className="min-h-64 rounded-xl border bg-card p-5">
            {html ? (
              <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Start writing to see the rendered post. Preview uses the same renderer as
                publishing, so what you see here is what readers get.
              </p>
            )}
          </div>
          {slug && (
            <p className="text-xs text-muted-foreground">
              URL: /posts/{slug}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
