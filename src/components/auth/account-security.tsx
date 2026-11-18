"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SecurityStatus = {
  enabled: boolean;
  available: boolean;
  recoveryCodesRemaining: number;
};

export function AccountSecurity({
  initialStatus,
}: {
  initialStatus: SecurityStatus;
}) {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(
    null,
  );
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  async function act(action: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/account/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, password, newPassword, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "The change could not be saved.");
        return;
      }
      if (action === "begin-mfa") {
        setSetup({ secret: data.secret, uri: data.uri });
        setCode("");
        return;
      }
      setPassword("");
      setNewPassword("");
      setCode("");
      setSetup(null);
      setRecoveryCodes(data.recoveryCodes ?? []);
      setCompleted(true);
    } catch {
      setError("The connection dropped. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (completed)
    return (
      <section className="space-y-5 rounded-xl border p-6" aria-live="polite">
        <h2 className="text-xl font-semibold">
          Your security settings are updated
        </h2>
        <p>
          All existing sessions have been signed out. Sign in again to continue.
        </p>
        {recoveryCodes.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Save your recovery codes</h3>
            <p className="text-sm text-muted-foreground">
              These are shown once. Store them in your password manager. Each
              code works once if you lose access to your authenticator.
            </p>
            <ul
              aria-label="Single-use recovery codes"
              className="space-y-2 break-all font-mono text-sm"
            >
              {recoveryCodes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        <Button asChild className="min-h-11">
          <Link href="/login?next=/account/security">Sign in again</Link>
        </Button>
      </section>
    );

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        void act("change-password");
      }}
    >
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Confirm it’s you</h2>
        <div className="space-y-2">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="min-h-11"
            required
            value={password}
            maxLength={256}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {(initialStatus.enabled || setup) && (
          <div className="space-y-2">
            <Label htmlFor="security-code">
              {setup
                ? "Code from your authenticator"
                : "Authenticator or recovery code"}
            </Label>
            <Input
              id="security-code"
              name="code"
              autoComplete="one-time-code"
              className="min-h-11"
              value={code}
              maxLength={64}
              onChange={(event) => setCode(event.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Use a new code for each security change. Authenticator codes
              refresh every 30 seconds.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold">Change password</h2>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            className="min-h-11"
            value={newPassword}
            minLength={12}
            maxLength={256}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            At least 12 characters. A short sentence works well.
          </p>
        </div>
        <Button
          type="submit"
          className="min-h-11"
          disabled={busy || !password || newPassword.length < 12}
        >
          Change password and sign out
        </Button>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold">Two-step verification</h2>
        <p className="text-sm text-muted-foreground">
          {initialStatus.enabled
            ? `Authenticator protection is enabled. ${initialStatus.recoveryCodesRemaining} recovery codes remain.`
            : "Add an authenticator app so a password alone cannot access your account."}
        </p>
        {!initialStatus.available && !initialStatus.enabled && (
          <p className="text-sm">
            Authenticator setup is temporarily unavailable. Try again later.
          </p>
        )}
        {setup && (
          <div className="space-y-4 rounded-lg bg-muted p-4">
            <p className="text-sm">
              In your authenticator app, add a time-based account named
              Bangalore Bikes and enter this setup key:
            </p>
            <p className="break-all font-mono text-sm select-all">
              {setup.secret}
            </p>
            <p className="text-sm text-muted-foreground">
              Enter the six-digit code above to finish. Setup expires in ten
              minutes. Keep this key private.
            </p>
            <Button
              type="button"
              className="min-h-11"
              disabled={busy || !password || !/^\d{6}$/.test(code)}
              onClick={() => void act("confirm-mfa")}
            >
              Enable authenticator
            </Button>
          </div>
        )}
        {!setup && (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={
              busy ||
              !password ||
              (!initialStatus.available && !initialStatus.enabled)
            }
            onClick={() =>
              void act(initialStatus.enabled ? "disable-mfa" : "begin-mfa")
            }
          >
            {initialStatus.enabled
              ? "Turn off authenticator protection"
              : "Set up authenticator"}
          </Button>
        )}
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold">Sign out everywhere</h2>
        <p className="text-sm text-muted-foreground">
          End all account sessions, including this one. Your posts and settings
          stay saved.
        </p>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={busy || !password}
          onClick={() => void act("sign-out-everywhere")}
        >
          Sign out all devices
        </Button>
      </section>
      <div aria-live="polite">
        {busy && <p className="text-sm">Saving your security settings…</p>}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
