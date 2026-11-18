"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AuthMode =
  | "signup"
  | "login"
  | "reset-request"
  | "reset-complete"
  | "verify";

const ACTIONS: Record<AuthMode, string> = {
  signup: "signup",
  login: "login",
  "reset-request": "reset-request",
  "reset-complete": "reset-complete",
  verify: "verify",
};

const COPY: Record<AuthMode, { submit: string; pending: string }> = {
  signup: { submit: "Create account", pending: "Creating your account…" },
  login: { submit: "Sign in", pending: "Signing in…" },
  "reset-request": { submit: "Send reset link", pending: "Sending…" },
  "reset-complete": { submit: "Set new password", pending: "Saving…" },
  verify: { submit: "Confirm email", pending: "Confirming…" },
};

type Status = { kind: "idle" | "error" | "success"; message: string };

export function AuthForm({
  mode,
  token = "",
  next = "/drafts",
}: {
  mode: AuthMode;
  token?: string;
  next?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  const verified = useRef(false);

  async function submit(payload: Record<string, string>) {
    setPending(true);
    setStatus({ kind: "idle", message: "" });
    try {
      const response = await fetch(`/api/account/${ACTIONS[mode]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        issues?: string[];
        code?: string;
      };
      if (!response.ok) {
        if (data.code === "MFA_REQUIRED") setMfaRequired(true);
        setStatus({
          kind: "error",
          message: data.issues?.length
            ? data.issues.join(". ")
            : (data.message ?? "That did not work"),
        });
        return;
      }
      setStatus({ kind: "success", message: data.message ?? "Done." });
      if (mode === "login" || mode === "verify") {
        router.push(next);
        router.refresh();
      }
      if (mode === "reset-complete") {
        router.push("/login");
        router.refresh();
      }
    } catch {
      setStatus({
        kind: "error",
        message: "The network dropped the request. Try again.",
      });
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") payload[key] = value;
    }
    if (mode === "verify" || mode === "reset-complete") payload.token = token;
    await submit(payload);
  }

  useEffect(() => {
    if (mode !== "verify" || !token || verified.current) return;
    verified.current = true;
    void submit({ token });
    // `submit` is stable enough for a one-shot confirmation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, token]);

  const copy = COPY[mode];

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            name="displayName"
            autoComplete="nickname"
            required
            minLength={2}
            maxLength={60}
            className="h-11"
            placeholder="How other riders will see you"
          />
        </div>
      )}

      {(mode === "signup" || mode === "login" || mode === "reset-request") && (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11"
          />
        </div>
      )}

      {(mode === "signup" || mode === "login" || mode === "reset-complete") && (
        <div className="space-y-2">
          <Label htmlFor="password">
            {mode === "reset-complete" ? "New password" : "Password"}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={mode === "login" ? 1 : 12}
            className="h-11"
          />
          {mode !== "login" && (
            <p className="text-sm text-muted-foreground">
              At least 12 characters. A short sentence works well.
            </p>
          )}
        </div>
      )}

      {mode === "login" && mfaRequired && (
        <div className="space-y-2">
          <Label htmlFor="login-code">Authenticator or recovery code</Label>
          <Input
            id="login-code"
            name="code"
            autoComplete="one-time-code"
            className="h-11"
            required
            maxLength={64}
          />
          <p className="text-sm text-muted-foreground">
            Enter a new six-digit code from your authenticator, or one of your
            unused recovery codes.
          </p>
        </div>
      )}

      <div aria-live="polite" className="min-h-6 text-sm">
        {status.kind === "error" && (
          <p role="alert" className="text-destructive">
            {status.message}
          </p>
        )}
        {status.kind === "success" && (
          <p className="text-foreground">{status.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="h-11 w-full"
        disabled={pending || (mode === "verify" && !token)}
      >
        {pending ? copy.pending : copy.submit}
      </Button>

      {(mode === "login" || mode === "signup") && (
        <div className="space-y-3 border-t pt-5">
          <p className="text-sm text-muted-foreground">
            More ways to sign in are on the way. Use your email and password for
            now.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled
            >
              Google · Coming soon
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled
            >
              GitHub · Coming soon
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
