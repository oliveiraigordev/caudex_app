"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl || "/" });
}

export async function signInWithApple(callbackUrl?: string) {
  await signIn("apple", { redirectTo: callbackUrl || "/" });
}

export async function signInWithCredentials(
  email: string,
  password: string,
  callbackUrl?: string,
) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/",
    });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof AuthError && err.type === "CredentialsSignin") {
      return { error: "E-mail ou senha incorretos." };
    }
    throw err;
  }
}
