import { timingSafeEqual } from "crypto";

export function loginEmailPasswordEnabled() {
  return Boolean(
    process.env.AUTH_LOGIN_EMAIL?.trim() &&
      process.env.AUTH_LOGIN_PASSWORD?.length,
  );
}

export function verifyLoginPassword(input: string, expected: string) {
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
