import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getServerUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a Bangalore Bikes account to publish ride reports, routes and workshop notes.",
};

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const user = await getServerUser();
  if (user) redirect("/drafts");

  return (
    <>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Join the riders</h1>
        <p className="text-muted-foreground">
          Write ride reports, keep a record of what worked, and help the next person
          heading out of the city.
        </p>
      </header>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <AuthForm mode="signup" />
      </div>

      <p className="text-sm text-muted-foreground">
        First posts are reviewed by a moderator before they go live. After three
        approved posts, publishing is immediate.
      </p>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="underline underline-offset-4" href="/login">
          Sign in
        </Link>
        .
      </p>
    </>
  );
}
