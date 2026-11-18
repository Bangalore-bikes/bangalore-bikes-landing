import assert from "node:assert/strict";
import test from "node:test";

import {
  decideSubmitStatus,
  decideTrust,
} from "../src/lib/posts/lifecycle.ts";

test("new authors are moderated and trusted authors publish directly", () => {
  assert.equal(decideSubmitStatus(0), "pending");
  assert.equal(decideSubmitStatus(1), "published");
  assert.equal(decideSubmitStatus(2), "published");
});

test("approvals promote and rejections demote", () => {
  assert.equal(decideTrust({ approvedCount: 2, rejectedCount: 0, isModerator: false }), 0);
  assert.equal(decideTrust({ approvedCount: 3, rejectedCount: 0, isModerator: false }), 1);
  assert.equal(decideTrust({ approvedCount: 9, rejectedCount: 1, isModerator: false }), 1);
  assert.equal(decideTrust({ approvedCount: 10, rejectedCount: 1, isModerator: false }), 2);
  assert.equal(decideTrust({ approvedCount: 8, rejectedCount: 2, isModerator: false }), 0);
});

test("moderators are never demoted by contributor counts", () => {
  assert.equal(decideTrust({ approvedCount: 0, rejectedCount: 5, isModerator: true }), 2);
});
