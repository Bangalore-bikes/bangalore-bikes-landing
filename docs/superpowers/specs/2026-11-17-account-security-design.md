# Account security and CLI activation

The owner requested email/password login, Google and GitHub placeholders, Brevo
SMTP, moderator provisioning, password changes, MFA and stronger abuse controls.
Keep the existing publishing architecture and free services.

## Account security

`/account/security` provides authenticated password changes, authenticator-app
TOTP enrollment, single-use recovery codes, MFA removal and session revocation.
Password changes require the current password and a second factor when enabled.
All security changes revoke sessions; the user signs in again. MFA is optional
until the owner scans/adds the secret and proves possession with a valid code.

Use otplib for RFC 6238 rather than implementing OTP algorithms. Encrypt the
shared secret with AES-256-GCM and a server-only, random 32-byte
`AUTH_ENCRYPTION_KEY`; bind ciphertext to the user ID as associated data.
Recovery codes have 128 bits of randomness, are displayed once, and are stored
as hashes. Consume both TOTP time steps and recovery codes atomically to prevent
replay. Store enrollment separately from active MFA and expire setup after ten
minutes. No OTP secret or recovery code enters logs, browser storage or URLs.

Email/password login checks MFA before issuing a session. A missing factor
returns an explicit challenge; the form resubmits credentials plus the code.
Password resets retain MFA and revoke all sessions. Security changes require
the current password; email ownership alone cannot remove MFA.

## Abuse controls

Keep database-backed atomic limits shared by serverless instances. Apply IP
limits before account limits and expensive password checks, including a fallback
bucket when an IP is unavailable. Add short and long windows for signup/login,
strict security-action limits, accurate Retry-After and expiry cleanup. Bound
actual streamed JSON bytes even without Content-Length; reject browser
cross-origin writes and non-JSON content types.

## Deployment

Use the authenticated Vercel CLI and Turso Starter plan only. Production uses
the actual attached Vercel origin until a custom domain is configured. Keep
production database credentials out of arbitrary previews. Configure Brevo over
STARTTLS on port 587 using the supplied secret, SMTP login and approved sender.
Provision the requested moderator with an Argon2id password hash only after the
intended database exists. Never commit passwords, SMTP keys or encryption keys.
Provider-required terms/login actions remain user steps. Do not claim complete
activation until mail delivery, migrations and authenticated account access work.
