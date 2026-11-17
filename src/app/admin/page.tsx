import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminSignIn } from "@/components/admin/admin-sign-in";
import { authOptions, hasAuthConfig, isAdminLogin } from "@/lib/auth";
import { hasDatabaseConfig } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content admin",
  robots: { index: false, follow: false },
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 py-12 sm:py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Content admin
        </h1>
        <p className="max-w-prose leading-relaxed text-muted-foreground">
          Manage community stories, rides, and resource links. Edits are
          validated against the public content schemas and revalidate the
          affected pages.
        </p>
      </header>
      {children}
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          Back to the public site
        </Link>
      </p>
    </main>
  );
}

function MissingConfig() {
  return (
    <div className="space-y-4 rounded-md border border-border bg-secondary p-6">
      <h2 className="text-xl font-semibold">Admin is not configured yet</h2>
      <p className="max-w-prose leading-relaxed">
        Set the server-only environment variables in your hosting project and
        redeploy. The setup contract is documented in{" "}
        <code>docs/activation-guide.md</code>: <code>GITHUB_ID</code>,{" "}
        <code>GITHUB_SECRET</code>, <code>NEXTAUTH_SECRET</code>,{" "}
        <code>ADMIN_GITHUB_LOGINS</code>, and the database variables{" "}
        <code>TURSO_DATABASE_URL</code> and <code>TURSO_AUTH_TOKEN</code>.
      </p>
      <p className="text-sm text-muted-foreground">
        Never expose these values with a <code>NEXT_PUBLIC_</code> prefix.
      </p>
    </div>
  );
}

export default async function AdminPage() {
  if (!hasAuthConfig()) {
    return (
      <Frame>
        <MissingConfig />
      </Frame>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <Frame>
        <AdminSignIn />
      </Frame>
    );
  }

  if (!isAdminLogin(session.user.login)) {
    return (
      <Frame>
        <div className="space-y-3 rounded-md border border-border bg-secondary p-6">
          <h2 className="text-xl font-semibold">Access denied</h2>
          <p className="max-w-prose leading-relaxed">
            Signed in as{" "}
            <strong>{session.user.login ?? session.user.name}</strong>, which is
            not on the moderator allowlist. Ask an owner to add your GitHub
            login to <code>ADMIN_GITHUB_LOGINS</code>.
          </p>
        </div>
      </Frame>
    );
  }

  if (!hasDatabaseConfig()) {
    return (
      <Frame>
        <div className="space-y-3 rounded-md border border-border bg-secondary p-6">
          <h2 className="text-xl font-semibold">
            Signed in, but the database is not configured
          </h2>
          <p className="max-w-prose leading-relaxed">
            Set <code>TURSO_DATABASE_URL</code> and{" "}
            <code>TURSO_AUTH_TOKEN</code>, then run{" "}
            <code>npm run db:migrate</code> against the intended database before
            editing content. See <code>docs/activation-guide.md</code>.
          </p>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      <AdminDashboard actor={session.user.login as string} />
    </Frame>
  );
}
