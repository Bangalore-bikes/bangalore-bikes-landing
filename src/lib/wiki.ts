import { z } from "zod";

const cell = z
  .object({
    v: z.union([z.string(), z.number(), z.boolean()]).nullable().optional(),
  })
  .nullable();
const sheetSchema = z.object({
  table: z.object({
    cols: z.array(z.object({ label: z.string() })).length(17),
    rows: z
      .array(z.object({ c: z.array(cell).length(17) }))
      .min(1)
      .max(500),
  }),
});

export const destinationSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  sourceNumber: z.string().regex(/^\d+$/),
  name: z.string().min(1),
  kind: z.string().min(1),
  distanceKm: z.number().positive().nullable(),
  cells: z.array(z.string()).length(17),
  source: z.enum(["sheet", "wiki"]),
});
export const destinationArchiveSchema = z.object({
  notice: z.string().min(1),
  columns: z.array(z.string()).length(17),
  rows: z.array(destinationSchema).min(1),
});
export type Destination = z.infer<typeof destinationSchema>;

export const wikiGuideSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    summary: z.string().min(1),
    attribution: z.string().min(1),
    sections: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
            title: z.string().min(1),
            paragraphs: z.array(z.string().min(1)),
            items: z.array(z.string().min(1)),
          })
          .strict(),
      )
      .min(1),
    sources: z
      .array(
        z
          .object({
            label: z.string().min(1),
            url: z
              .string()
              .url()
              .refine((url) => url.startsWith("https://")),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
export type WikiGuide = z.infer<typeof wikiGuideSchema>;

export function parseWikiGuides(input: unknown) {
  const guides = z.array(wikiGuideSchema).parse(input);
  if (new Set(guides.map((guide) => guide.slug)).size !== guides.length)
    throw new Error("Duplicate guide slugs");
  for (const guide of guides) {
    if (
      new Set(guide.sections.map((section) => section.id)).size !==
      guide.sections.length
    )
      throw new Error("Duplicate section anchors");
  }
  return guides;
}

export function parseDestinationSheet(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No worksheet data returned");
  const { table } = sheetSchema.parse(JSON.parse(text.slice(start, end + 1)));
  const notice = table.cols
    .map((column) => column.label)
    .find((label) => label.includes("2010"));
  if (!notice)
    throw new Error(
      "Worksheet age notice is missing; review the source before importing",
    );
  const rows = table.rows.map((row) => {
    const cells = row.c.map((item) => String(item?.v ?? "").trim());
    const distanceKm = cells[4] === "" ? null : Number(cells[4]);
    return destinationSchema.parse({
      id:
        cells[0] +
        "-" +
        cells[1]
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      sourceNumber: cells[0],
      name: cells[1],
      kind: cells[3],
      distanceKm,
      cells,
      source: "sheet",
    });
  });
  if (new Set(rows.map((row) => row.id)).size !== rows.length)
    throw new Error("Duplicate destination IDs");
  return destinationArchiveSchema.parse({
    notice,
    columns: table.cols.map((col, index) =>
      index === 0 ? "No." : col.label.trim(),
    ),
    rows,
  });
}

