import assert from "node:assert/strict";
import test from "node:test";

import {
  isAdminLogin,
  parseAdminLogins,
} from "../src/lib/admin-allowlist.ts";

test("admin logins are normalized, deduplicated and invalid entries dropped", () => {
  assert.deepEqual(
    parseAdminLogins(" @Moderator, second-mod, MODERATOR, , not a login, -bad "),
    ["moderator", "second-mod"],
  );
  assert.deepEqual(parseAdminLogins(undefined), []);
  assert.deepEqual(parseAdminLogins(""), []);
});

test("only allowlisted GitHub logins are administrators", () => {
  const allowlist = parseAdminLogins("trusted-mod");
  assert.equal(isAdminLogin("trusted-mod", allowlist), true);
  assert.equal(isAdminLogin("TRUSTED-MOD", allowlist), true);
  assert.equal(isAdminLogin("someone-else", allowlist), false);
  assert.equal(isAdminLogin(undefined, allowlist), false);
  assert.equal(isAdminLogin("trusted-mod", []), false);
});
