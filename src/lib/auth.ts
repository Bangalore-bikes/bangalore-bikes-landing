import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { isAdminLogin } from "./admin-allowlist";

export {
  isAdminLogin,
  parseAdminLogins,
} from "./admin-allowlist";

export function hasAuthConfig(): boolean {
  return Boolean(
    process.env.GITHUB_ID?.trim() &&
      process.env.GITHUB_SECRET?.trim() &&
      process.env.NEXTAUTH_SECRET?.trim(),
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const login =
        profile && "login" in profile
          ? String((profile as { login?: unknown }).login ?? "")
          : "";
      return isAdminLogin(login);
    },
    async jwt({ token, profile }) {
      if (profile && "login" in profile) {
        const login = String((profile as { login?: unknown }).login ?? "");
        if (login) token.login = login.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.login === "string") {
        session.user.login = token.login;
      }
      return session;
    },
  },
};
