# Activation guide: Vercel/Netlify + managed libSQL

Official sources checked: 17 November 2026. Keep the existing hosting provider; use a remote Turso Cloud **libSQL** database for durable writes. This guide is for the implementation using NextAuth **4.24.15**, GitHub OAuth and `@libsql/client` **0.18.0**. It does not activate accounts, migrate data or deploy anything by itself.

## 1. Code-ready is not activated

- **Code-ready:** the main implementation has landed, including `/admin`, the GitHub auth handler, server-side moderator authorization, database-backed CRUD/public reads and `npm run db:migrate`.
- **Activated/deployed:** the correct databases and OAuth apps exist, all seven environment variables are configured, schema initialization succeeded on the intended databases, the updated code has been deployed, and the checks below pass.

Before following the migration/deployment steps, inspect the deployed revision's `package.json` and confirm those dependencies and the `db:migrate` script exist. If absent, wait for the main implementation; do not invent a migration command or treat the existing static site as activated.

Do not use `file:./…`, a bundled `.db` file or `/tmp` as production storage. Vercel Functions have a read-only application filesystem; writable `/tmp` is instance-local and ephemeral, not a durable/shared SQLite database. Use the remote database on either host. [Vercel filesystem documentation](https://vercel.com/docs/functions/runtimes#file-system-support)

## 2. Decide the two isolated environments

| Setting | Production | Staging |
| --- | --- | --- |
| Public origin / GitHub Homepage URL | `https://bangalorebikes.com` | `https://bangalorebikes.vercel.app` |
| Exact `NEXTAUTH_URL` | `https://bangalorebikes.com` | `https://bangalorebikes.vercel.app` |
| GitHub Authorization callback URL | `https://bangalorebikes.com/api/auth/callback/github` | `https://bangalorebikes.vercel.app/api/auth/callback/github` |
| Suggested OAuth app name | `Bangalore Bikes Production` | `Bangalore Bikes Staging` |
| Suggested new libSQL database name | `bangalore-bikes-production` | `bangalore-bikes-staging` |
| Credentials | Production app ID/secret, database token and auth secret | Different app ID/secret, database token and auth secret |

`NEXTAUTH_URL` is the canonical origin, not `/admin` or the callback URL; no trailing slash is needed here. Set it explicitly for this setup rather than relying on host inference. [NextAuth v4 environment options](https://next-auth.js.org/configuration/options#environment-variables)

**Check domain routing before assigning secrets.** The default `bangalorebikes.vercel.app` alias may serve the same production deployment as a custom domain on the Vercel project; its name does not make it a staging environment. One deployment has one environment-variable set, not different database credentials per incoming hostname. Confirm that the two origins serve distinct deployments with separately scoped variables. If they currently share a deployment, establish isolated staging routing/project configuration first; do not claim staging isolation merely by adding Preview variables. If the required hostname cannot be assigned to the isolated deployment, resolve the hostname plan before OAuth activation and update both the callback and `NEXTAUTH_URL` together.

## 3. Create two Turso Cloud libSQL databases

1. Sign in to the [Turso dashboard](https://turso.tech/app), select the intended organization and review its plan/usage limits.
2. Create a new, dedicated database for each environment. If the dashboard offers engine choices, choose **libSQL**, not the newer Turso Database engine. Do not select an existing database belonging to another app.
3. If the dashboard does not expose the engine choice clearly, use the official CLI path below. Turso's current quickstart explicitly creates libSQL by **omitting `--tursodb`**. The newer engine is not a drop-in assumption for this pinned client. [Cloud quickstart](https://docs.turso.tech/quickstart), [remote libSQL TypeScript client](https://docs.turso.tech/sdk/ts/quickstart#remote-libsql-database-libsqlclient)

Install the CLI using the [official installation instructions](https://docs.turso.tech/cli/installation) (Windows instructions use WSL). In that supported terminal, run:

```sh
turso auth login
turso db create bangalore-bikes-production
turso db create bangalore-bikes-staging
turso db show bangalore-bikes-production
turso db show bangalore-bikes-staging
```

If you have multiple organizations, select the intended organization first; if creation asks for a group, choose the intended libSQL group using `--group <group-name>`. Names above are examples: if unavailable, choose unique dedicated names and use them consistently. [Database creation reference](https://docs.turso.tech/cli/db/create)

4. Copy each database's connection URL from its details/dashboard or `turso db show` output. Set that environment's `TURSO_DATABASE_URL` to the supplied remote `libsql://…` URL, not a dashboard URL or local file path. [Database details reference](https://docs.turso.tech/cli/db/show)
5. Generate a separate **database-scoped read/write token** for each database using its dashboard token control, or:

```sh
turso db tokens create bangalore-bikes-production
turso db tokens create bangalore-bikes-staging
```

Store each result privately as the matching `TURSO_AUTH_TOKEN`. Do not use an organization/platform API token or a read-only token: admin CRUD needs writes. Review token expiration and arrange rotation before expiry; the CLI reference currently documents no expiry by default. Never paste token output in chat, screenshots, issues or commits. [Database token reference](https://docs.turso.tech/cli/db/tokens/create)

## 4. Register separate GitHub OAuth apps

1. Open [Register a new OAuth application](https://github.com/settings/applications/new). Use **OAuth Apps**, not the separate GitHub Apps registration form.
2. Register `Bangalore Bikes Production` with the production Homepage URL and exact callback from the table.
3. Open the same registration page again and register `Bangalore Bikes Staging` with the staging values.
4. Open each app's settings under [GitHub OAuth Apps](https://github.com/settings/developers). Copy its Client ID into that environment's `GITHUB_ID`; generate a Client Secret and store it privately as that environment's `GITHUB_SECRET`.
5. Leave Device Flow disabled; it is not this browser sign-in flow. If registration offers expiring user access tokens, follow GitHub's compatibility guidance: do not enable that feature unless the deployed NextAuth integration handles their expiry/refresh.

Use one explicitly configured callback per app and separate app credentials for the two environments. **Documentation discrepancy:** NextAuth v4's GitHub provider documentation still states one callback URL per client ID/secret, but GitHub's current registration documentation now permits up to ten callbacks. Separate apps remain the chosen setup here; do not present the older one-callback limit as a universal current GitHub restriction. [NextAuth v4 GitHub provider](https://next-auth.js.org/providers/github), [GitHub OAuth registration](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

The GitHub provider callback is `/api/auth/callback/github`; do not register `/admin`, `/api/auth/signin` or a changing deployment-preview URL. [NextAuth OAuth callback flow](https://next-auth.js.org/configuration/providers/oauth)

## 5. Generate auth secrets and select real moderators

Run this locally in a private terminal with Node.js, **once per environment**:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Save each output directly into the appropriate hosting secret store as `NEXTAUTH_SECRET`. Do not paste it in chat or commit it. Keep the value stable across redeployments; changing it invalidates existing sessions. [Node.js randomBytes](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback), [NextAuth secret configuration](https://next-auth.js.org/configuration/options#nextauth_secret)

For `ADMIN_GITHUB_LOGINS`, replace **all placeholder profiles** with the actual approved moderators' GitHub login names, comma-separated: the login portion of their GitHub profile URL, with no `@`, full URL, display name, email or Reddit username. Do not grant access to an example identity just because it appears in sample configuration. Confirm each login with the moderator before activation. Configure the intended list independently for production and staging; an authenticated GitHub user is not automatically an authorized admin.

## 6. Save the seven server-side environment variables

| Variable | Value to enter in each environment |
| --- | --- |
| `TURSO_DATABASE_URL` | That environment's new hosted libSQL URL |
| `TURSO_AUTH_TOKEN` | Its database-scoped read/write token |
| `GITHUB_ID` | Its OAuth app Client ID |
| `GITHUB_SECRET` | Its OAuth app Client Secret |
| `NEXTAUTH_SECRET` | Its separately generated random secret |
| `NEXTAUTH_URL` | The exact production or staging origin in section 2 |
| `ADMIN_GITHUB_LOGINS` | Real approved moderator GitHub logins, comma-separated |

These are the application's server-side contract. **Do not add `NEXT_PUBLIC_` prefixes**, embed secrets in browser code or put them in committed configuration. Paste raw values without shell assignment syntax or wrapping quotes into the hosting UI. Keep production credentials out of preview/untrusted branch environments.

### Vercel: `krithikmcodes-projects/bangalorebikes`

1. Sign in to [Vercel](https://vercel.com/dashboard), choose the `krithikmcodes-projects` team and open `bangalorebikes`.
2. Open **Settings → Environment Variables** (or Environment Variables in the project sidebar).
3. Add all seven keys for **Production**, using production values. Add a separate set for the isolated staging deployment's environment/project, using staging values. Scope Preview values to the intended staging branch if applicable; do not expose secrets to arbitrary previews.
4. Verify the domain-to-deployment mapping from section 2, then save.
5. After schema initialization below, use **Deployments → intended deployment → Redeploy**, or trigger a fresh deployment of the intended revision. Changed variables do not update existing deployments. [Official Vercel environment-variable setup and redeployment instructions](https://vercel.com/docs/environment-variables/managing-environment-variables)

The authenticated project-specific settings URL could not be verified publicly, so use the dashboard navigation and official instructions above rather than assuming a deep link is valid.

### Netlify: `bangalore-bikes` (if this is the active host)

1. Sign in to [Netlify](https://app.netlify.com/), open the `bangalore-bikes` project, then **Project configuration → Environment variables**.
2. Add all seven keys through the UI. Select scopes that include **Functions** for server runtime and **Builds** where build/prerender steps need them; making secrets available only at build time is insufficient for runtime auth/CRUD.
3. Set production values for the Production context. Use staging values only for the isolated staging branch/context, if Netlify actually serves that staging origin. Netlify variables do not configure Vercel deployments; configure each active host independently.
4. After schema initialization, trigger a fresh deploy from **Deploys**. Environment updates require a new build/deploy to take effect.

The exact authenticated settings link for this project was not verified. Use [Netlify environment-variable documentation](https://docs.netlify.com/build/configure-builds/environment-variables/) and [runtime Functions environment variables](https://docs.netlify.com/build/functions/environment-variables/). Preserve the existing Next.js server deployment; a static export alone cannot run NextAuth/API writes.

## 7. Initialize only the intended databases, then redeploy

1. Wait until the main implementation provides `npm run db:migrate`. Review the actual script and its environment-loading behavior before running it. This guide does not supply schema SQL or modify application code.
2. In a trusted local terminal or approved deployment job, supply the intended environment's `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` privately. Hosting settings do not automatically populate a local terminal; do not assume the migration runner loads `.env.local` unless its code explicitly does so.
3. Compare the configured URL with the matching new database in Turso. Inspect the target's tables in Turso before any schema change. **Never enable automatic/build/startup migrations or run this command against an unrelated existing database.** If the target contains unexpected tables/data, stop and correct the target. Back up an existing intended app database before upgrades.
4. Initialize staging first from the implementation checkout:

```sh
npm run db:migrate
```

5. Confirm successful completion and expected app tables in the **staging** database. Supply the separate production credentials, recheck the production target and run the same command once for **production**. Do not mix a URL from one environment with the other's token.
6. Deploy/redeploy the code-ready revision on each active host after saving variables and initializing its database. Check deployment and runtime logs for missing configuration, auth callback errors and database errors without logging secrets.

## 8. Verify activation as a moderator and visitor

Run the full check on staging first, then a clearly labeled disposable record in production:

1. Open `https://bangalorebikes.vercel.app/admin` for staging or `https://bangalorebikes.com/admin` for production. Sign in using an allowlisted moderator's GitHub account. Confirm the OAuth app/environment and return hostname are correct.
2. In a signed-out/incognito browser, confirm admin actions are blocked. Also test a GitHub account **not** in the allowlist; it must not gain admin read/write access. A hidden admin link is not authorization.
3. Exercise **create → read → update → delete** on a disposable record in each enabled admin content section. Check edits after refreshing and signing in again. Confirm changes persist after a redeployment, not just within one function instance.
4. Where draft/publish controls exist, ensure a draft is absent from public pages; publish it and check the corresponding public listing/detail in a separate signed-out browser; update it and verify the change, then unpublish/delete it and verify removal. Check the public URL as a visitor, not just an admin success message.
5. Confirm the staging test record never appears in production and vice versa. Inspect the expected database to confirm the write landed there. Public repository content already present on a page is not evidence that database-backed CRUD works.
6. If a callback fails, recheck exact scheme/hostname/path, matching OAuth app credentials and `NEXTAUTH_URL`; after any host environment change, redeploy before retesting.

## 9. Backups, recovery and operating cost

Before real moderator edits, inspect Turso's recovery controls for each database. Confirm the recovery window included in the actual subscription, record the recovery procedure and test recovery with a disposable staging database first. Never rehearse destructive recovery against live production. [Turso point-in-time recovery](https://docs.turso.tech/features/point-in-time-recovery)

For an additional off-platform snapshot, use `turso db export <database-name> --output-file <private-backup-path>` from a trusted terminal and store it outside the repository with restricted access. **Turso warns that exported snapshots may omit the latest changes**; verify freshness and a restore before relying on one as a complete backup. Keep a documented backup schedule and test restores to a separate database, not over production. [Official export reference](https://docs.turso.tech/cli/db/export)

Do not assume this is zero-cost. Review database/storage/read/write/recovery limits and hosting usage, subscription terms and overages for the actual accounts: [Turso pricing](https://turso.tech/pricing), [Turso usage and billing](https://docs.turso.tech/help/usage-and-billing), [Vercel pricing](https://vercel.com/pricing), [Netlify pricing](https://www.netlify.com/pricing/).

## 10. Community publishing: rider accounts and posts

This is a separate surface from the GitHub admin panel. It uses the same libSQL
database, and is inert until the steps below are done.

1. **Create a Resend account** and verify the sending domain (for example
   `bangalorebikes.com`) under **Domains**. Add the DNS records Resend shows, wait
   for verification, then create an API key under **API Keys**. The free tier
   covers 3,000 messages a month and 100 a day, far above expected volume.
2. **Save the new server-side variables** in the same environment as the existing
   ones:

   | Variable | Value |
   | --- | --- |
   | `RESEND_API_KEY` | the Resend API key |
   | `MAIL_FROM` | a verified sender, e.g. `Bangalore Bikes <hello@bangalorebikes.com>` |
   | `ADMIN_EMAILS` | real moderator account emails, comma-separated |
   | `NEXT_PUBLIC_SITE_URL` | the exact origin, so mail links point at the right host |

   Leave `RESEND_API_KEY` unset in preview environments if you do not want preview
   sign-ups to send mail; the transport then logs instead of sending.

3. **Create the community tables** against the intended database, with that
   environment's credentials supplied privately:

   ```sh
   npm run db:migrate:posts
   ```

   The script prints the target host, the tables it found and whether `posts_fts`
   was created. It only issues `CREATE … IF NOT EXISTS`; re-running is a no-op. It
   never alters or drops existing content tables.

4. **Redeploy** so the runtime sees the new variables and the migrated schema.

5. **Verify** on staging first:

   - Sign up at `/signup` with an address listed in `ADMIN_EMAILS`, open the
     confirmation mail, and confirm the link signs you in.
   - Open the same link twice; the second attempt must be refused.
   - Write a post at `/write`, submit it, and open `/moderation`.
   - Approve it, then check `/posts`, `/posts/<slug>`, `/writers/<handle>`,
     `/rss.xml` and `sitemap.xml` in a signed-out browser.
   - Create a second account not in `ADMIN_EMAILS`, submit a post, and confirm it
     waits in the queue and `/moderation` refuses that account.
   - Request a password reset, use the link once, and confirm existing sessions are
     signed out.

6. **If mail does not arrive**, check the Resend logs for the domain, then confirm
   `MAIL_FROM` uses the verified domain and not a `gmail.com` or other public
   mailbox. Runtime logs record only the recipient's domain, never the address.

## End-user activation checklist

- [ ] Code-ready implementation and `db:migrate` command are present in the deployed revision.
- [ ] Production/staging serve isolated deployments with separate libSQL databases/tokens and OAuth apps/secrets.
- [ ] All seven server variables are saved with exact origins/callbacks; placeholder admins are replaced with real moderator logins.
- [ ] Correct target databases are initialized; active hosts have been freshly deployed/redeployed.
- [ ] `/admin` login works for moderators; unauthorized access is denied; CRUD, public visibility and persistence checks pass.
- [ ] Community publishing: `RESEND_API_KEY`, `MAIL_FROM`, `ADMIN_EMAILS` and `NEXT_PUBLIC_SITE_URL` are saved; `npm run db:migrate:posts` ran against the intended database; confirmation mail arrives; a moderator can approve a post and see it public; a rider account is refused at `/moderation`.
- [ ] Backup freshness/restore and subscription limits are checked. Only then label the feature **activated/deployed**.

## Direct setup links

- [Turso dashboard / database creation entry point](https://turso.tech/app) — sign in, choose the organization, create **libSQL**; use the CLI fallback if the engine choice is unclear.
- [Exact libSQL creation instructions](https://docs.turso.tech/quickstart) · [Database URL/details](https://docs.turso.tech/cli/db/show) · [Database auth tokens](https://docs.turso.tech/cli/db/tokens/create).
- [Create GitHub OAuth app](https://github.com/settings/applications/new) · [Manage OAuth apps/client secrets](https://github.com/settings/developers).
- [Vercel dashboard](https://vercel.com/dashboard) → `krithikmcodes-projects/bangalorebikes` → Settings → Environment Variables; [official setup instructions](https://vercel.com/docs/environment-variables/managing-environment-variables).
- [Netlify dashboard](https://app.netlify.com/) → `bangalore-bikes` → Project configuration → Environment variables; [official setup instructions](https://docs.netlify.com/build/configure-builds/environment-variables/).
- [Production admin](https://bangalorebikes.com/admin) · [Staging admin](https://bangalorebikes.vercel.app/admin) — verify after activation; these links are not proof of deployed functionality.
