import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getServerUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to write, publish and discuss ride reports on Bangalore Bikes.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getServerUser();
  if (user) redirect("/drafts");
  const { next } = await searchParams;
  const target = next && next.startsWith("/") ? next : "/drafts";

  return (
    <>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground">
          Riders write here with an email address and a password, the way a forum has
          always worked.
        </p>
      </header>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <AuthForm mode="login" next={target} />
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          New here?{" "}
          <Link className="underline underline-offset-4" href="/signup">
            Create an account
          </Link>
          .
        </p>
        <p>
          Forgotten your password?{" "}
          <Link className="underline underline-offset-4" href="/reset">
            Reset it
          </Link>
          .
        </p>
      </div>
    </>
  );
}
