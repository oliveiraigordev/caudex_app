import type { NextAuthConfig } from "next-auth";

/** Config leve para middleware (Edge) — sem Prisma nem providers. */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  trustHost: true,
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
