"use client";

import { Button } from "@/components/ui/button";

export function AdminSignIn() {
  return (
    <div className="space-y-4">
      <p className="max-w-prose leading-relaxed text-muted-foreground">
        GitHub sign-in for content management is coming soon. Community authors
        can sign in with email and password to write and manage their posts.
      </p>
      <Button className="min-h-11" disabled>
        GitHub sign-in · Coming soon
      </Button>
    </div>
  );
}
