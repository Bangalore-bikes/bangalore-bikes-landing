import assert from "node:assert/strict";
import test from "node:test";

import {
  hashPassword,
  passwordProblem,
  verifyPassword,
} from "../src/lib/auth/password.ts";

test("a password verifies only against its own hash", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword(hash, "correct horse battery staple"), true);
  assert.equal(await verifyPassword(hash, "wrong password entirely"), false);
});

test("a malformed stored hash never authenticates", async () => {
  assert.equal(await verifyPassword("not-a-hash", "anything at all"), false);
  assert.equal(await verifyPassword("", "anything at all"), false);
  assert.equal(await verifyPassword("$argon2id$broken", "anything at all"), false);
});

test("the same password produces different hashes each time", async () => {
  const first = await hashPassword("correct horse battery staple");
  const second = await hashPassword("correct horse battery staple");
  assert.notEqual(first, second);
});

test("password length rules are explicit", () => {
  assert.match(String(passwordProblem("short")), /12 characters/);
  assert.equal(passwordProblem("twelve characters"), null);
  assert.match(String(passwordProblem("x".repeat(300))), /256 characters/);
});
