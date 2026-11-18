"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type DraftRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  updatedAt: string;
  version: number;
  wordCount: number;
  moderationNote: string | null;
};

const LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "In review",
  published: "Published",
  rejected: "Rejected",
  unpublished: "Unpublished",
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export function DraftsList({ drafts }: { drafts: DraftRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function submit(id: string, expectedVersion: number) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/posts/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedVersion, publish: true }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? "The post could not be submitted");
        return;
      }
      router.refresh();
    } catch {
      setError("The network dropped the request. Try again.");
    } finally {
      setBusyId("");
    }
  }

  if (drafts.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-lg font-medium">Nothing written yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          A ride report, a route note, a workshop that did right by you. Start with one
          paragraph.
        </p>
        <Button asChild className="mt-4 h-11">
          <Link href="/write">Write your first post</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </p>
      )}
      <ul className="space-y-3">
        {drafts.map((draft) => (
          <li key={draft.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{LABELS[draft.status] ?? draft.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Saved {DATE.format(new Date(draft.updatedAt))} · {draft.wordCount} words
                  </span>
                </div>
                <h3 className="text-lg font-medium">
                  <Link className="underline-offset-4 hover:underline" href={`/write?id=${draft.id}`}>
                    {draft.title}
                  </Link>
                </h3>
                {draft.moderationNote && (
                  <p className="text-sm text-muted-foreground">
                    Moderator note: {draft.moderationNote}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="h-11">
                  <Link href={`/write?id=${draft.id}`}>Edit</Link>
                </Button>
                {draft.status === "published" && (
                  <Button asChild variant="ghost" className="h-11">
                    <Link href={`/posts/${draft.slug}`}>View</Link>
                  </Button>
                )}
                {draft.status !== "pending" && draft.status !== "published" && (
                  <Button
                    type="button"
                    className="h-11"
                    disabled={busyId === draft.id}
                    onClick={() => void submit(draft.id, draft.version)}
                  >
                    {busyId === draft.id ? "Submitting…" : "Submit"}
                  </Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
