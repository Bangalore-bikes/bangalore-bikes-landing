import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

// Run the real route and database; only Next's request-context cache API needs
// a stand-in outside a Next server.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/cache") {
      return {
        url: "data:text/javascript,export function revalidatePath() {}",
        shortCircuit: true,
      };
    }
    if (specifier.startsWith("@/")) {
      return nextResolve(
        new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});

test("a saved draft accepts versioned edits and refuses stale saves", async () => {
  process.env.TURSO_DATABASE_URL = "file::memory:";
  const { getPostsClient } = await import("../src/lib/db.ts");
  const { migratePosts } = await import("../src/lib/posts/migrate.ts");
  const { createDraft } = await import("../src/lib/posts/repository.ts");
  const { createAuthService } = await import("../src/lib/auth/service.ts");
  const { PUT } = await import("../src/app/api/posts/[id]/route.ts");
  const client = getPostsClient();
  await migratePosts(client);
  let confirmation;
  const service = createAuthService({
    client,
    baseUrl: "https://example.com",
    mail: {
      configured: true,
      async send(message) {
        confirmation = message.text;
      },
    },
  });
  await service.signUp({
    email: "route@example.com",
    displayName: "Route Rider",
    password: "a long route passphrase",
  });
  const { user, session } = await service.verifyEmail(
    /token=([A-Za-z0-9_-]+)/.exec(confirmation)[1],
  );
  const input = {
    title: "A morning ride to Nandi",
    summary: "A detailed account of a morning ride from Hebbal to Nandi Hills.",
    bodyMd: "A quiet road.",
    tags: ["rides"],
  };
  const post = await createDraft(client, { authorId: user.id, input });
  const context = { params: Promise.resolve({ id: post.id }) };
  const request = () =>
    new Request(`https://example.com/api/posts/${post.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `bb_session=${session}`,
      },
      body: JSON.stringify({
        ...input,
        title: "A revised morning ride to Nandi",
        expectedVersion: 1,
      }),
    });
  const response = await PUT(request(), context);
  assert.equal(
    response.status,
    200,
    JSON.stringify(await response.clone().json()),
  );
  assert.equal((await response.json()).post.version, 2);
  assert.equal((await PUT(request(), context)).status, 409);
});
