"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AdminSignIn() {
  return (
    <div className="space-y-4">
      <p className="max-w-prose leading-relaxed text-muted-foreground">
        Content management is limited to approved moderator GitHub accounts.
        Signing in with any other account will be denied.
      </p>
      <Button
        className="min-h-11"
        onClick={() => signIn("github", { callbackUrl: "/admin" })}
      >
        Sign in with GitHub
      </Button>
    </div>
  );
}
