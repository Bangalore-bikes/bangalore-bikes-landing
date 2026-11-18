import assert from "node:assert/strict";
import test from "node:test";
import { generateSync } from "otplib";
import { createSecurityService } from "../src/lib/auth/security.ts";
import { authFixture } from "./helpers/auth-fixture.mjs";

async function securityFixture(t) {
  const fixture = await authFixture(t);
  return { ...fixture, security: createSecurityService(fixture) };
}
const codeFor = (secret, fixture) =>
  generateSync({ secret, epoch: fixture.now().getTime() / 1000 });

test("password rotation invalidates an in-flight MFA enrollment or removal", async (t) => {
  for (const action of ["confirm", "disable"]) {
    const f = await securityFixture(t);
    const setup = await f.security.beginEnrollment(f.user.id, f.password);
    let recoveryCodes;
    if (action === "disable")
      ({ recoveryCodes } = await f.security.confirmEnrollment(
        f.user.id,
        f.password,
        codeFor(setup.secret, f),
      ));
    const originalBatch = f.client.batch.bind(f.client);
    f.client.batch = (statements, mode) => {
      // Password reset wins after reauthentication, before the MFA write locks.
      f.db
        .prepare(
          "UPDATE users SET password_hash = 'rotated-by-another-request' WHERE id = ?",
        )
        .run(f.user.id);
      return originalBatch(statements, mode);
    };
    await assert.rejects(
      action === "confirm"
        ? f.security.confirmEnrollment(
            f.user.id,
            f.password,
            codeFor(setup.secret, f),
          )
        : f.security.disableMfa(f.user.id, f.password, recoveryCodes[0]),
      (error) => error.code === "CONFLICT",
    );
    assert.equal(
      (await f.security.status(f.user.id)).enabled,
      action === "disable",
    );
  }
});

test("a password change revokes an in-flight reset before its password write", async (t) => {
  const f = await securityFixture(t);
  await f.auth.requestReset({ email: f.user.email });
  const token = /token=([A-Za-z0-9_-]+)/.exec(f.messages.at(-1).text)[1];
  const execute = f.client.execute.bind(f.client);
  const batch = f.client.batch.bind(f.client);
  let rotated = false;
  const rotate = async () => {
    if (rotated) return;
    rotated = true;
    await f.security.changePassword(
      f.user.id,
      f.password,
      "the owners newer safe password",
    );
  };
  f.client.execute = async (statement) => {
    const result = await execute(statement);
    if (statement.sql.includes("UPDATE email_tokens SET used_at"))
      await rotate();
    return result;
  };
  f.client.batch = async (statements, mode) => {
    if (
      statements[0].sql.includes("UPDATE users") &&
      statements[0].sql.includes("email_tokens")
    )
      await rotate();
    return batch(statements, mode);
  };
  await assert.rejects(
    f.auth.completeReset({ token, password: "attacker stale reset password" }),
    (error) => error.code === "INVALID_TOKEN",
  );
  assert.equal(rotated, true);
  assert.ok(
    (
      await f.auth.logIn({
        email: f.user.email,
        password: "the owners newer safe password",
      })
    ).session,
  );
});

test("MFA is encrypted, requires confirmation and revokes existing sessions", async (t) => {
  const f = await securityFixture(t);
  await assert.rejects(f.security.beginEnrollment(f.user.id, "wrong"));
  const setup = await f.security.beginEnrollment(f.user.id, f.password);
  assert.match(setup.uri, /^otpauth:\/\/totp\//);
  assert.equal((await f.security.status(f.user.id)).enabled, false);
  await assert.rejects(
    f.security.confirmEnrollment(f.user.id, f.password, "not-a-code"),
  );
  const { recoveryCodes } = await f.security.confirmEnrollment(
    f.user.id,
    f.password,
    codeFor(setup.secret, f),
  );
  assert.equal((await f.security.status(f.user.id)).enabled, true);
  assert.equal(recoveryCodes.length, 10);
  assert.equal(await f.auth.currentUser(f.session), null);
  const row = f.db
    .prepare("SELECT * FROM user_mfa WHERE user_id = ?")
    .get(f.user.id);
  assert.ok(!JSON.stringify(row).includes(setup.secret));
  const stored = f.db.prepare("SELECT code_hash FROM mfa_recovery_codes").all();
  assert.ok(stored.every((row) => !recoveryCodes.includes(row.code_hash)));
});

test("expired MFA enrollment cannot be enabled", async (t) => {
  const f = await securityFixture(t);
  const setup = await f.security.beginEnrollment(f.user.id, f.password);
  f.advance(601);
  await assert.rejects(
    f.security.confirmEnrollment(
      f.user.id,
      f.password,
      codeFor(setup.secret, f),
    ),
  );
  assert.equal((await f.security.status(f.user.id)).enabled, false);
});

test("login requires MFA; OTP and recovery codes cannot be replayed", async (t) => {
  const f = await securityFixture(t);
  const setup = await f.security.beginEnrollment(f.user.id, f.password);
  const { recoveryCodes } = await f.security.confirmEnrollment(
    f.user.id,
    f.password,
    codeFor(setup.secret, f),
  );
  const credentials = { email: f.user.email, password: f.password };
  await assert.rejects(
    f.auth.logIn(credentials),
    (e) => e.code === "MFA_REQUIRED",
  );
  await assert.rejects(
    f.auth.logIn({ ...credentials, code: "invalid" }),
    (e) => e.code === "INVALID_CREDENTIALS",
  );
  f.advance(30);
  const code = codeFor(setup.secret, f);
  assert.ok((await f.auth.logIn({ ...credentials, code })).session);
  await assert.rejects(
    f.auth.logIn({ ...credentials, code }),
    (e) => e.code === "INVALID_CREDENTIALS",
  );
  const results = await Promise.allSettled([
    f.auth.logIn({ ...credentials, code: recoveryCodes[0] }),
    f.auth.logIn({ ...credentials, code: recoveryCodes[0] }),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal((await f.security.status(f.user.id)).recoveryCodesRemaining, 9);
});

test("password changes reauthenticate, preserve MFA and revoke sessions", async (t) => {
  const f = await securityFixture(t);
  const setup = await f.security.beginEnrollment(f.user.id, f.password);
  const { recoveryCodes } = await f.security.confirmEnrollment(
    f.user.id,
    f.password,
    codeFor(setup.secret, f),
  );
  const loggedIn = await f.auth.logIn({
    email: f.user.email,
    password: f.password,
    code: recoveryCodes[0],
  });
  await assert.rejects(
    f.security.changePassword(
      f.user.id,
      "wrong",
      "a new long test passphrase",
      recoveryCodes[1],
    ),
  );
  await assert.rejects(
    f.security.changePassword(
      f.user.id,
      f.password,
      "a new long test passphrase",
    ),
  );
  await f.security.changePassword(
    f.user.id,
    f.password,
    "a new long test passphrase",
    recoveryCodes[1],
  );
  assert.equal(await f.auth.currentUser(loggedIn.session), null);
  assert.equal((await f.security.status(f.user.id)).enabled, true);
  await assert.rejects(
    f.auth.logIn({
      email: f.user.email,
      password: f.password,
      code: recoveryCodes[2],
    }),
  );
  assert.ok(
    (
      await f.auth.logIn({
        email: f.user.email,
        password: "a new long test passphrase",
        code: recoveryCodes[2],
      })
    ).session,
  );
});

test("email password reset does not bypass MFA; disabling MFA requires a factor", async (t) => {
  const f = await securityFixture(t);
  const setup = await f.security.beginEnrollment(f.user.id, f.password);
  const { recoveryCodes } = await f.security.confirmEnrollment(
    f.user.id,
    f.password,
    codeFor(setup.secret, f),
  );
  await f.auth.requestReset({ email: f.user.email });
  const token = /token=([A-Za-z0-9_-]+)/.exec(f.messages.at(-1).text)[1];
  const password = "new test password after reset";
  await f.auth.completeReset({ token, password });
  await assert.rejects(
    f.auth.logIn({ email: f.user.email, password }),
    (e) => e.code === "MFA_REQUIRED",
  );
  await assert.rejects(f.security.disableMfa(f.user.id, password));
  await f.security.disableMfa(f.user.id, password, recoveryCodes[0]);
  assert.equal((await f.security.status(f.user.id)).enabled, false);
  assert.ok((await f.auth.logIn({ email: f.user.email, password })).session);
});
