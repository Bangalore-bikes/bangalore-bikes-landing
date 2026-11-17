"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  collectionLabels,
  collectionNames,
  type CollectionName,
} from "@/lib/content-meta";
import { newRecordTemplate } from "@/lib/content-templates";

type StoredRecord = {
  collection: CollectionName;
  id: string;
  data: unknown;
  version: number;
  deleted: boolean;
  published: boolean;
};

type Note = { kind: "error" | "success"; text: string; issues?: string[] };

type ListResponse = { records?: StoredRecord[]; message?: string };
type RecordResponse = {
  record?: StoredRecord;
  message?: string;
  issues?: string[];
};

async function readResponse<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export function AdminDashboard({ actor }: { actor: string }) {
  const [collection, setCollection] = useState<CollectionName>("articles");
  const [records, setRecords] = useState<StoredRecord[]>([]);
  const [selected, setSelected] = useState<StoredRecord | null>(null);
  const [editorText, setEditorText] = useState("");
  const [version, setVersion] = useState<number | null>(null);
  const [published, setPublished] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (target: CollectionName, selectId?: string) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/content/${target}?t=${Date.now()}`,
          { cache: "no-store" },
        );
        const body = await readResponse<ListResponse>(response);
        if (!response.ok) {
          setRecords([]);
          setNote({
            kind: "error",
            text: body.message ?? "Could not load records.",
          });
          return;
        }
        const list = body.records ?? [];
        setRecords(list);
        if (selectId) {
          const match = list.find((record) => record.id === selectId);
          if (match) {
            setSelected(match);
            setEditorText(JSON.stringify(match.data, null, 2));
            setVersion(match.version);
            setPublished(match.published);
            setIsNew(false);
          }
        }
      } catch {
        setNote({ kind: "error", text: "Could not reach the content API." });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load(collection);
  }, [collection, load]);

  function chooseCollection(next: CollectionName) {
    setCollection(next);
    setSelected(null);
    setEditorText("");
    setVersion(null);
    setIsNew(false);
    setNote(null);
  }

  function selectRecord(record: StoredRecord) {
    setSelected(record);
    setEditorText(JSON.stringify(record.data, null, 2));
    setVersion(record.version);
    setPublished(record.published);
    setIsNew(false);
    setNote(null);
  }

  function startNew() {
    setSelected(null);
    setEditorText(JSON.stringify(newRecordTemplate(collection), null, 2));
    setVersion(null);
    setPublished(collection === "rides");
    setIsNew(true);
    setNote(null);
  }

  function payloadData(): unknown | null {
    try {
      return JSON.parse(editorText) as unknown;
    } catch (error) {
      setNote({
        kind: "error",
        text: `The record is not valid JSON: ${
          error instanceof Error ? error.message : "parse error"
        }`,
      });
      return null;
    }
  }

  async function save() {
    const data = payloadData();
    if (data === null) return;
    setBusy(true);
    setNote(null);
    try {
      const response = await fetch(
        isNew
          ? `/api/admin/content/${collection}`
          : `/api/admin/content/${collection}/${encodeURIComponent(
              selected?.id ?? "",
            )}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isNew ? { data, published } : { data, version, published },
          ),
        },
      );
      const body = await readResponse<RecordResponse>(response);
      if (!response.ok || !body.record) {
        setNote({
          kind: "error",
          text: body.message ?? "The record could not be saved.",
          issues: body.issues,
        });
        return;
      }
      const saved = body.record;
      setSelected(saved);
      setEditorText(JSON.stringify(saved.data, null, 2));
      setVersion(saved.version);
      setPublished(saved.published);
      setIsNew(false);
      setNote({
        kind: "success",
        text: `Saved ${saved.id} at version ${saved.version}. Public pages were revalidated.`,
      });
      await load(collection, saved.id);
    } catch {
      setNote({ kind: "error", text: "Could not reach the content API." });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!selected || version === null) return;
    if (
      !window.confirm(
        `Delete ${selected.id}? The public page will be removed after revalidation.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const response = await fetch(
        `/api/admin/content/${collection}/${encodeURIComponent(selected.id)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version }),
        },
      );
      const body = await readResponse<RecordResponse>(response);
      if (!response.ok) {
        setNote({
          kind: "error",
          text: body.message ?? "The record could not be deleted.",
        });
        return;
      }
      setSelected(null);
      setEditorText("");
      setVersion(null);
      setIsNew(false);
      setNote({ kind: "success", text: `Deleted ${selected.id}.` });
      await load(collection);
    } catch {
      setNote({ kind: "error", text: "Could not reach the content API." });
    } finally {
      setBusy(false);
    }
  }

  const labels = collectionLabels[collection];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Content collections">
        {collectionNames.map((name) => (
          <Button
            key={name}
            role="tab"
            aria-selected={name === collection}
            variant={name === collection ? "default" : "outline"}
            className="min-h-11"
            onClick={() => chooseCollection(name)}
          >
            {collectionLabels[name].plural}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-medium">{actor}</span>. Changes are
        validated, versioned, audited, and revalidate public pages.
      </p>

      {note && (
        <div
          role={note.kind === "error" ? "alert" : "status"}
          className={
            note.kind === "error"
              ? "rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm"
              : "rounded-md border border-border bg-secondary p-4 text-sm"
          }
        >
          <p>{note.text}</p>
          {note.issues && note.issues.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {note.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section aria-label={`${labels.plural} records`} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{labels.plural}</h2>
            <Button variant="outline" className="min-h-10" onClick={startNew}>
              New
            </Button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading records…</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No {labels.plural.toLowerCase()} stored yet. Seed the repository
              content with <code>npm run db:migrate</code>, or create one.
            </p>
          ) : (
            <ul className="space-y-2">
              {records.map((record) => (
                <li key={record.id}>
                  <button
                    type="button"
                    onClick={() => selectRecord(record)}
                    className={
                      "w-full rounded-md border p-3 text-left transition-colors hover:bg-secondary " +
                      (selected?.id === record.id
                        ? "border-ring bg-secondary"
                        : "border-border")
                    }
                  >
                    <span className="block break-all font-medium">
                      {record.id}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {record.published ? "Public" : "Hidden"} · version{" "}
                      {record.version}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label={`${labels.singular} editor`} className="space-y-4">
          <h2 className="text-lg font-semibold">
            {isNew ? `New ${labels.singular.toLowerCase()}` : "Record editor"}
          </h2>
          {!isNew && !selected ? (
            <p className="text-sm text-muted-foreground">
              Select a record to edit, or create a new one.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="record-json">Record JSON</Label>
                <Textarea
                  id="record-json"
                  value={editorText}
                  onChange={(event) => setEditorText(event.target.value)}
                  spellCheck={false}
                  rows={20}
                  className="min-h-96 font-mono text-xs"
                  aria-describedby="record-json-help"
                />
                <p
                  id="record-json-help"
                  className="text-xs text-muted-foreground"
                >
                  Keep the {collection === "resources" ? "id" : "slug"} equal to
                  the record key. Saving applies the published schema; invalid
                  records are rejected with field-level errors.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="record-published"
                  type="checkbox"
                  className="size-5 accent-current"
                  checked={published}
                  onChange={(event) => setPublished(event.target.checked)}
                />
                <Label htmlFor="record-published">
                  Visible on public pages
                  {collection !== "rides" &&
                    " (requires status: published; unchecking hides it)"}
                </Label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="min-h-11"
                  onClick={() => void save()}
                  disabled={busy}
                >
                  {busy ? "Saving…" : isNew ? "Create record" : "Save changes"}
                </Button>
                {!isNew && selected && (
                  <Button
                    variant="outline"
                    className="min-h-11"
                    onClick={() => void remove()}
                    disabled={busy}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="min-h-11"
                  onClick={() => {
                    if (isNew) {
                      setEditorText(
                        JSON.stringify(newRecordTemplate(collection), null, 2),
                      );
                      return;
                    }
                    if (selected) selectRecord(selected);
                  }}
                  disabled={busy}
                >
                  Reset editor
                </Button>
              </div>

              {!isNew && selected && (
                <p className="text-xs text-muted-foreground">
                  Editing <strong>{selected.id}</strong> · version{" "}
                  {selected.version}. A conflict means someone changed it
                  first: reload the list before retrying.
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Input
          readOnly
          value={`/api/admin/content/${collection}`}
          aria-label="Content API endpoint"
          className="max-w-md font-mono text-xs"
        />
      </div>
    </div>
  );
}
