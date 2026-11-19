# Community publishing: accounts, posts and moderation

Riders can create an account with an email address and a password, write a post in
Markdown, and publish it. This document covers how that works, what a moderator
sees, and the environment variables that switch it on.

The feature is designed to be inert until the owner provisions a database, an email
sender and a moderator list. Nothing here is activated by deploying the code alone.

## 1. What exists

| Surface | Path | Who |
| --- | --- | --- |
| Sign up | `/signup` | anyone |
| Sign in | `/login` | anyone with a confirmed account |
| Confirm email | `/verify?token=…` | link from the confirmation mail |
| Reset password | `/reset?token=…` | link from the reset mail |
| Write | `/write` | signed-in riders |
| Your posts | `/drafts` | the author |
| Moderation | `/moderation` | moderators |
| Public feed | `/posts` | everyone |
| A post | `/posts/[slug]` | everyone |
| An author | `/writers/[handle]` | everyone |
| Feed | `/rss.xml` | everyone |

The GitHub moderator panel at `/admin` is unchanged and independent. It manages the
repository-backed collections; this feature manages user posts in dedicated tables.

## 2. Trust rules

| Approved posts | Rejected posts | Level | Effect |
| --- | --- | --- | --- |
| 0–2 | 0–1 | 0 | submissions wait for a moderator |
| 3–9 | 0–1 | 1 | submissions publish immediately |
| 10+ | 0–1 | 2 | veteran, publishes immediately |
| any | 2+ | 0 | demoted, submissions wait again |

Moderators are always level 2 and are never demoted by contributor counts. The
decision table exists once in `src/lib/posts/lifecycle.ts` and once as SQL in
`src/lib/posts/repository.ts`; a test runs both over a matrix of counts so they
cannot drift.

Editing a post that is already visible puts it back through the trust decision:
a level-0 author's published post returns to review, a trusted author's stays live.
Posts retracted by a moderator stay unpublished while edited and must pass review
when resubmitted, even for trusted authors. Moderation decisions require the
version shown in the queue; changes made during review require a fresh review.

## 3. Statuses

```
draft ──submit──▶ pending ──approve──▶ published ──unpublish──▶ unpublished
                     │                     │
                     └──reject──▶ rejected  └──edit──▶ pending (level 0)
```

Only `published` rows are readable by the feed, the article page, RSS, the sitemap
and search. `GET /api/posts/[id]` is the only read that returns other statuses, and
it requires the author or a moderator.

Every transition appends one `post_revisions` row and one `content_audit` row keyed
to the version the write produced. Saves use optimistic concurrency: a stale
`expectedVersion` answers `409`, never a silent overwrite.

## 4. Writing

Post bodies are Markdown with a closed directive set. Raw HTML is dropped, links are
hardened, images must be `https`, and the result is sanitised against a strict
allowlist before it is stored. Rendering happens once, at save time, so a reader
request never parses contributor input.

Supported directives:

```md
:::callout{type=note}
One of note, tip, warning or danger. Anything else falls back to note.
:::

:::gallery
![Alt text](https://example.com/photo.jpg)
:::

:::map{place="Nandi Hills"}
Renders a link to OpenStreetMap. No iframes, no embedded maps.
:::

:::faq
### Is it safe for a beginner?
Yes, at a steady pace, and not on a Sunday morning.
:::
```

An unknown or misspelled directive (`:::galery`) is restored as literal text so a
typo never deletes what the author wrote. `tests/markdown-render.test.mjs` covers
script injection, `onerror` attributes, `javascript:` URLs and malformed directives.

Covers are plain `<img>` elements rather than `next/image`, so an author can point at
any `https` URL without an image-host allowlist. Width and height are set, so the
layout does not shift while the image loads.

## 5. Accounts

- Passwords are hashed with argon2id; only the hash is stored.
- Verification and reset tokens are random, stored as SHA-256 hashes, single use and
  time limited (24 hours and 60 minutes respectively).
- Sessions are database rows with an opaque token in an `httpOnly`, `SameSite=Lax`
  cookie, `Secure` on https. A session deleted or a user disabled after sign-in is
  refused on the very next request.
- Sign-in is throttled to 5 attempts per account and 20 per address per 15 minutes.
- Sign-up and reset responses never reveal whether an address exists.
- Completing a password reset deletes every session for that account.

Moderators are bootstrapped by listing their account emails in `ADMIN_EMAILS`. The
promotion happens when they confirm their address, so the list is checked against a
verified mailbox rather than a typed one.

## 6. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | yes | the same libSQL database the content admin uses |
| `TURSO_AUTH_TOKEN` | yes, for a remote database | write token |
| `BREVO_SMTP_LOGIN` | yes, for Brevo | SMTP login from Brevo, which can differ from your account email |
| `BREVO_SMTP_KEY` | yes, for Brevo | SMTP key, stored as a hosting secret |
| `RESEND_API_KEY` | optional alternative | used only when Brevo SMTP is not configured |
| `MAIL_FROM` | yes, with the key | verified sender, e.g. `Bangalore Bikes <hello@bangalorebikes.com>` |
| `ADMIN_EMAILS` | yes, to have moderators | comma-separated account emails |
| `NEXT_PUBLIC_SITE_URL` | recommended | canonical origin used in mail links |
| `AUTH_ENCRYPTION_KEY` | yes, for MFA setup | random 32-byte key encoded as 64 hexadecimal characters; keep stable and private |

All except `NEXT_PUBLIC_SITE_URL` are server-only. Brevo connects to
`smtp-relay.brevo.com:587` with mandatory STARTTLS and certificate validation.
`MAIL_FROM` must be an approved Brevo sender. When neither transport is configured,
local development logs only recipient domains and never logs message bodies or links.

## 7. Turning it on

1. Use the existing libSQL database (or create one as in the activation guide).
2. Set the variables above for the environment.
3. Run `npm run db:migrate:posts`. It only creates tables and is safe to repeat.
4. Redeploy so the new variables reach the runtime.
5. Sign up with an address listed in `ADMIN_EMAILS`, confirm it, and open
   `/moderation`.

`npm run db:migrate:posts` creates `users`, `sessions`, `email_tokens`, `posts`,
`post_revisions`, `post_comments`, `post_reactions`, `workshop_reviews`,
`rate_limits`, `uploads`, `user_mfa`, `mfa_recovery_codes`, the shared `content_audit` table and an FTS5 `posts_fts`
index. If the SQLite build lacks FTS5 the index is skipped with a warning and search
falls back to `LIKE`; nothing else fails.

## 8. API

Writes require JSON and reject browser cross-origin requests. Actual streamed
bodies are capped at 128 KB, even when Content-Length is missing. Authentication
and security limits use shared database counters, with IP and account buckets,
short and long windows, expiry cleanup and Retry-After responses.

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/account/signup` | none | generic response either way |
| POST | `/api/account/login` | none | sets the session cookie |
| POST | `/api/account/logout` | session | clears only this session |
| POST | `/api/account/verify` | token | sets the session cookie |
| POST | `/api/account/reset-request` | none | generic response |
| POST | `/api/account/reset-complete` | token | signs out other sessions |
| GET | `/api/posts` | rider | the caller's posts, all statuses |
| POST | `/api/posts` | rider | create a draft |
| GET | `/api/posts/[id]` | author or moderator | |
| PUT | `/api/posts/[id]` | author | requires `expectedVersion` |
| POST | `/api/posts/[id]/submit` | author | `{ expectedVersion, publish }` |
| POST | `/api/posts/preview` | rider | renders Markdown, stores nothing |
| GET | `/api/posts/[id]/comments` | none | published comments plus the viewer (`null` when signed out) |
| POST | `/api/posts/[id]/comments` | rider | `{ body }`, plain text up to 1000 characters, 10 per hour |
| DELETE | `/api/posts/[id]/comments?commentId=` | author or moderator | soft delete |
| POST | `/api/moderation/[id]` | moderator | `{ action, note, expectedVersion }` |
| GET/POST | `/api/account/security` | session | account security status and authenticated changes |

### Comments

Signed-in riders can comment on published posts. Comments are plain text, stored in
`post_comments` and rendered as text, so there is no HTML to sanitise. They publish
immediately; a moderator can remove any comment and an author their own. Comments
from disabled accounts are hidden. The post page is cached, so comments load from the
API in the browser. Logic and tests: `src/lib/posts/comments.ts`,
`tests/post-comments.test.mjs`.

### Account security

Open `/account/security` from Your posts. Password changes require the current
password and, when enabled, an authenticator or unused recovery code. MFA setup
uses a time-based authenticator app and requires confirmation within ten minutes.
The encrypted setup secret is not enabled until confirmation. Save the ten
single-use recovery codes shown after enrollment; they cannot be displayed again.
Codes and setup keys are never stored in browser storage or sent to an external
QR service. Password/MFA changes sign out all devices and revoke outstanding
email links. Password resets preserve MFA. Losing both the authenticator and all
recovery codes requires an owner-assisted recovery process; email alone does not
turn off MFA. Google and GitHub sign-in are currently coming-soon placeholders.

Errors use one mapping in `src/lib/http.ts`: `400` invalid, `401` unauthenticated,
`403` wrong user, `404` missing, `409` conflict or wrong state, `429` throttled with
`Retry-After`, `503` unconfigured or unmigrated.

## 9. Tests

```bash
npm run test:posts
```

Covers the renderer, input schema, slug rules, password hashing, tokens, rate limits,
the migration, the trust lifecycle, repository transitions, the account flows, the
guards and the structured data. Route handlers themselves are thin; the behaviour they
depend on is tested directly.
