# Account Security Implementation Plan

> Execute inline using executing-plans, with one fresh whole-change review.

**Goal:** Activate email publishing and provide password changes, TOTP MFA,
recovery codes and stronger request limits.

**Architecture:** Extend the existing identity database with separate MFA and
recovery-code tables. Keep security operations in a dedicated service, using the
existing auth session guards. Configure hosting and database through CLIs.

**Tech stack:** Next.js 15, libSQL, Argon2id, otplib, Node crypto, Nodemailer.

**Spec:** `docs/superpowers/specs/2026-11-17-account-security-design.md`.

## Constraints and review focus

- No secrets in committed files or tool output; no paid service or plan.
- MFA setup is not enabled before confirmation; pending setup expires.
- Simultaneous recovery-code and TOTP reuse has exactly one success.
- A password reset cannot bypass enabled MFA.
- Password/MFA changes revoke existing sessions and outstanding email tokens.
- Stream size and per-IP limits apply before expensive processing.

## Tasks

1. [x] Brevo transport and parser remediation: test configured SMTP transport
   selection with an injected transport, and HTML heading text decoding. Implement
   in `src/lib/mail.ts`, `src/lib/markdown/toc.ts`, and corresponding tests.
2. [x] MFA persistence/service: add idempotent DDL in `src/lib/posts/migrate.ts`;
   create `src/lib/auth/mfa.ts` and `security.ts`. Write SQLite-backed tests for
   setup expiry, OTP/recovery replay, password reauthentication, session revocation
   and password-reset preservation. Run the failures, implement, rerun.
3. [x] Auth wiring and settings: require MFA before sessions in `service.ts`,
   expose security API under `/api/account/security`, add `/account/security`,
   link from drafts and add the second-factor field to `AuthForm`.
4. [x] Abuse controls: add streamed-body and cross-origin request tests to
   `tests/http-errors.test.mjs`; extend rate-limit tests for expiration and
   accurate retry times. Implement bounds and account/IP limits.
5. [ ] Activation: configure Vercel secrets, create intended Turso database after
   provider authentication/terms, run migrations and provision the owner account.
   Verify SMTP and production deployment. Record any external blocker accurately.
6. [ ] Run complete tests, lint, typecheck, build/SEO checks and a fresh focused
   security review; fix findings, push/link PR, deploy through Vercel CLI.

## Ledger

- Ruling: continue the existing feature branch because activation depends on its
  unpublished commits; do not start from main or lose the publishing work.
- Vercel authenticated and linked. Production origin is
  `https://bangalorebikes.vercel.app`; no custom domain is attached.
- Native Turso CLI installed via official Go install, module v1.0.34. Not logged in.
- Vercel Turso provisioning currently requires the owner's Marketplace acceptance.
- Brevo SMTP key stored through the secret tool and in Vercel. Sender verification
  and end-to-end delivery still require validation.

- Verification: 130 tests pass; TypeScript, lint, production build, 7 SEO tests,
  content validation and direct browser smoke including Storybook pass.
- Brevo STARTTLS authentication succeeded and accepted one setup test email
  addressed to the owner. Inbox delivery has not been independently confirmed.
- Fresh security review found two concurrency defects. Both were reproduced
  and fixed with interleaving tests; security tests are in the standard npm suite.
- Production CLI deployment started. Turso provisioning and moderator account
  creation still wait on owner-only Marketplace terms acceptance.
