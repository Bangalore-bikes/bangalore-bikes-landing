import {
  jsonError,
  readJsonObject,
  requireAdmin,
  revalidateContent,
  storeErrorResponse,
} from "@/lib/admin-api";
import {
  isCollectionName,
  validateRecord,
} from "@/lib/content-config";
import { getContentStore } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ collection: string }> };

export async function GET(_request: Request, { params }: Context) {
  const guard = await requireAdmin();
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const { collection } = await params;
  if (!isCollectionName(collection)) {
    return jsonError(404, "Unknown content collection");
  }

  try {
    const records = await getContentStore().list(collection, "all");
    return Response.json(
      { records },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return storeErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Context) {
  const guard = await requireAdmin();
  if (!guard.ok) return jsonError(guard.status, guard.message);

  const { collection } = await params;
  if (!isCollectionName(collection)) {
    return jsonError(404, "Unknown content collection");
  }

  const body = await readJsonObject(request);
  if (!body || !("data" in body)) {
    return jsonError(400, "Send a JSON body with a data object");
  }

  const published =
    typeof body.published === "boolean" ? body.published : undefined;
  const validation = validateRecord(collection, body.data, published);
  if (!validation.ok) {
    return jsonError(400, validation.message, validation.issues);
  }

  try {
    const record = await getContentStore().create(
      collection,
      validation.id,
      validation.data,
      guard.login,
      { published: validation.published },
    );
    revalidateContent(collection, validation.id);
    return Response.json({ record }, { status: 201 });
  } catch (error) {
    return storeErrorResponse(error);
  }
}
