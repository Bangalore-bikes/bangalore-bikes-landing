import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Confirm your email",
  description: "Confirm the email address on your Bangalore Bikes account.",
};

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Confirm your email</h1>
        <p className="text-muted-foreground">
          {token
            ? "Confirming the link now. You will be signed in as soon as it is checked."
            : "Open the link from the confirmation email. If it expired, sign in and request a new one."}
        </p>
      </header>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <AuthForm mode="verify" token={token ?? ""} />
      </div>

      <p className="text-sm text-muted-foreground">
        <Link className="underline underline-offset-4" href="/login">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
