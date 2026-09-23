import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";
import {
  loginEmailPasswordEnabled,
  verifyLoginPassword,
} from "@/lib/login-password";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [];

if (loginEmailPasswordEnabled()) {
  const allowedEmail = process.env.AUTH_LOGIN_EMAIL!.trim().toLowerCase();
  const password = process.env.AUTH_LOGIN_PASSWORD!;

  providers.push(
    Credentials({
      id: "credentials",
      name: "E-mail e senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const pass = String(credentials?.password ?? "");
        if (!email || !pass) return null;
        if (email !== allowedEmail) return null;
        if (!verifyLoginPassword(pass, password)) return null;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              emailVerified: new Date(),
              name: "Cultivador",
            },
          });
        }
        return user;
      },
    }),
  );
}

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
