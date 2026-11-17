"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type QueueItem = {
  id: string;
  title: string;
  summary: string;
  bodyHtml: string | null;
  authorName: string;
  authorHandle: string;
  trustLevel: number;
  updatedAt: string;
  version: number;
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const TRUST_LABEL: Record<number, string> = {
  0: "New author",
  1: "Trusted author",
  2: "Veteran author",
};

type Action = "approve" | "reject" | "unpublish";

export function ModerationQueue({ items }: { items: QueueItem[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function act(id: string, action: Action) {
    setError("");
    setBusyId(id);
    try {
      const response = await fetch(`/api/moderation/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: notes[id] ?? "" }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? "The decision could not be recorded");
        return;
      }
      router.refresh();
    } catch {
      setError("The network dropped the request. Try again.");
    } finally {
      setBusyId("");
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-lg font-medium">The queue is clear</p>
        <p className="mt-1 text-sm text-muted-foreground">
          New submissions from untrusted authors will appear here.
        </p>
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

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border bg-card p-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="secondary">{TRUST_LABEL[item.trustLevel] ?? "Author"}</Badge>
                <span className="text-muted-foreground">
                  {item.authorName} (@{item.authorHandle}) · submitted{" "}
                  {DATE.format(new Date(item.updatedAt))}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-medium">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
              </div>

              <details className="rounded-lg border bg-background/50 p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Read the full draft
                </summary>
                <div
                  className="post-body mt-3"
                  dangerouslySetInnerHTML={{ __html: item.bodyHtml ?? "" }}
                />
              </details>

              <div className="space-y-2">
                <Label htmlFor={`note-${item.id}`}>Note to the author</Label>
                <Textarea
                  id={`note-${item.id}`}
                  rows={2}
                  value={notes[item.id] ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({ ...current, [item.id]: event.target.value }))
                  }
                  placeholder="Required when rejecting: what needs to change?"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="h-11"
                  disabled={busyId === item.id}
                  onClick={() => void act(item.id, "approve")}
                >
                  Approve and publish
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  disabled={busyId === item.id || !(notes[item.id] ?? "").trim()}
                  onClick={() => void act(item.id, "reject")}
                >
                  Reject
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
