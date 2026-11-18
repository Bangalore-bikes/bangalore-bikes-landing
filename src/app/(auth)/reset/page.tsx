import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Choose a new password for your Bangalore Bikes account.",
};

export const dynamic = "force-dynamic";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {token ? "Choose a new password" : "Reset your password"}
        </h1>
        <p className="text-muted-foreground">
          {token
            ? "The link works once. Choosing a new password signs out every other session."
            : "Enter the address you signed up with, and we will email a reset link that lasts an hour."}
        </p>
      </header>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <AuthForm mode={token ? "reset-complete" : "reset-request"} token={token ?? ""} />
      </div>

      <p className="text-sm text-muted-foreground">
        <Link className="underline underline-offset-4" href="/login">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
