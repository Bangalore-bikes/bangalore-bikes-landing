import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountSecurity } from "@/components/auth/account-security";
import { getServerUser } from "@/lib/auth/server";
import { createSecurityService } from "@/lib/auth/security";
import { getPostsClient } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Account security",
  robots: { index: false, follow: false },
};

export default async function SecurityPage() {
  const user = await getServerUser();
  if (!user) redirect("/login?next=/account/security");
  const status = await createSecurityService({
    client: getPostsClient(),
  }).status(user.id);
  return (
    <main className="mx-auto w-full max-w-xl space-y-8 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Account security
        </h1>
        <p className="text-muted-foreground">
          Protect the account for {user.email}.
        </p>
      </header>
      <AccountSecurity initialStatus={status} />
    </main>
  );
}
