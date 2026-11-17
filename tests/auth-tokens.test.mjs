import assert from "node:assert/strict";
import test from "node:test";
import { safeAccountPath } from "../src/lib/auth/redirect.ts";

test("account redirects stay on this site", () => {
  for (const value of [
    "//attacker.example",
    "/\\attacker.example",
    "https://attacker.example",
    "/\n/attacker.example",
  ]) {
    assert.equal(safeAccountPath(value), "/drafts");
  }
  assert.equal(
    safeAccountPath("/account/security?tab=mfa"),
    "/account/security?tab=mfa",
  );
});

import { createToken, hashToken, safeEqual } from "../src/lib/auth/tokens.ts";

test("tokens are unguessable and stored hashed", () => {
  const first = createToken();
  const second = createToken();
  assert.notEqual(first.token, second.token);
  assert.ok(first.token.length >= 43);
  assert.equal(first.hash, hashToken(first.token));
  assert.notEqual(first.hash, first.token);
});

test("hashing is stable and comparison is length safe", () => {
  const token = "a".repeat(43);
  assert.equal(hashToken(token), hashToken(token));
  assert.equal(safeEqual(token, token), true);
  assert.equal(safeEqual(token, "b".repeat(43)), false);
  assert.equal(safeEqual(token, "short"), false);
});
