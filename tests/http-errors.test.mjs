import assert from "node:assert/strict";
import test from "node:test";

import { AuthError } from "../src/lib/auth/service.ts";
import { errorResponse } from "../src/lib/http.ts";
import { PostError } from "../src/lib/posts/repository.ts";

test("post conflicts answer 409 and missing posts answer 404", async () => {
  assert.equal(errorResponse(new PostError("CONFLICT", "changed")).status, 409);
  assert.equal(errorResponse(new PostError("BAD_STATE", "already live")).status, 409);
  assert.equal(errorResponse(new PostError("NOT_FOUND", "gone")).status, 404);
  assert.equal(errorResponse(new PostError("FORBIDDEN", "nope")).status, 403);
  assert.equal(errorResponse(new PostError("INVALID_INPUT", "bad")).status, 400);
  const note = await errorResponse(new PostError("NOTE_REQUIRED", "explain")).json();
  assert.equal(note.message, "explain");
});

test("auth failures map to their real status codes", () => {
  assert.equal(errorResponse(new AuthError("INVALID_CREDENTIALS", "no")).status, 401);
  assert.equal(errorResponse(new AuthError("UNVERIFIED", "confirm")).status, 403);
  assert.equal(errorResponse(new AuthError("EMAIL_TAKEN", "taken")).status, 409);
  assert.equal(errorResponse(new AuthError("INVALID_TOKEN", "used")).status, 400);
  assert.equal(errorResponse(new AuthError("WEAK_PASSWORD", "short")).status, 400);
});

test("throttling answers 429 with a Retry-After header", async () => {
  const response = errorResponse(new AuthError("THROTTLED", "later", 900));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "900");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("an unconfigured database reports 503 rather than 500", () => {
  const response = errorResponse(new Error("no such table: posts"));
  assert.equal(response.status, 503);
  assert.equal(errorResponse(new Error("TURSO_DATABASE_URL is not configured")).status, 503);
});
