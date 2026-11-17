import {
  jsonError,
  readJsonObject,
  requireAdmin,
  revalidateContent,
  storeErrorResponse,
} from "@/lib/admin-api";
import { isCollectionName, validateRecord } from "@/lib/content-config";
import { getContentStore } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ collection: string; id: string }> };

function readVersion(value: unknown): number | null {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 1
    ? value
    : null;
}

export async function PUT(request: Request, { params }: Context) {
  const guard = await requireAdmin();
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const { collection, id } = await params;
  if (!isCollectionName(collection)) {
    return jsonError(404, "Unknown content collection");
  }

  const body = await readJsonObject(request);
  const version = readVersion(body?.version);
  if (!body || !("data" in body) || version === null) {
    return jsonError(400, "Send data and the current integer version");
  }

  const published =
    typeof body.published === "boolean" ? body.published : undefined;
  const validation = validateRecord(collection, body.data, published);
  if (!validation.ok) {
    return jsonError(400, validation.message, validation.issues);
  }
  if (validation.id !== id) {
    return jsonError(
      400,
      "The record identity cannot be changed; keep the URL key equal to the slug or id.",
    );
  }

  try {
    const record = await getContentStore().update(
      collection,
      id,
      validation.data,
      version,
      guard.login,
      { published: validation.published },
    );
    revalidateContent(collection, id);
    return Response.json({ record });
  } catch (error) {
    return storeErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const guard = await requireAdmin();
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const { collection, id } = await params;
  if (!isCollectionName(collection)) {
    return jsonError(404, "Unknown content collection");
  }

  const body = await readJsonObject(request);
  const version = readVersion(body?.version);
  if (version === null) {
    return jsonError(400, "Send the current integer version");
  }

  try {
    await getContentStore().delete(collection, id, version, guard.login);
    revalidateContent(collection, id);
    return Response.json({ ok: true });
  } catch (error) {
    return storeErrorResponse(error);
  }
}
