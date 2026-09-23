"use server";

import { signIn } from "@/auth";

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl || "/" });
}

export async function signInWithApple(callbackUrl?: string) {
  await signIn("apple", { redirectTo: callbackUrl || "/" });
}
