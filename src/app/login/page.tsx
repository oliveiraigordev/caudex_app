import { auth } from "@/auth";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginCredentialsForm } from "@/components/login-credentials-form";
import { signInWithApple, signInWithGoogle } from "./actions";
import { loginEmailPasswordEnabled } from "@/lib/login-password";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session?.user) redirect(callbackUrl || "/");

  const hasCredentials = loginEmailPasswordEnabled();
  const hasGoogle =
    Boolean(process.env.AUTH_GOOGLE_ID) &&
    Boolean(process.env.AUTH_GOOGLE_SECRET);
  const hasApple =
    Boolean(process.env.AUTH_APPLE_ID) &&
    Boolean(process.env.AUTH_APPLE_SECRET);
  const hasAnyProvider = hasCredentials || hasGoogle || hasApple;

  return (
    <PageShell narrow className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg shadow-stone-300/20">
        <div className="text-center">
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c45c4a] to-[#8f3d32] text-white shadow-md"
          >
            <Sprout className="h-7 w-7" strokeWidth={2} />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--foreground)]">
            Entrar no Caudexia
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Seu viveiro de rosa-do-deserto — dados privados por conta.
          </p>
        </div>

        <div className="space-y-3">
          {hasCredentials ? (
            <LoginCredentialsForm callbackUrl={callbackUrl} />
          ) : null}
          {hasCredentials && (hasGoogle || hasApple) ? (
            <p className="text-center text-xs text-[var(--muted)]">ou</p>
          ) : null}
          {hasGoogle ? (
            <form
              action={async () => {
                "use server";
                await signInWithGoogle(callbackUrl);
              }}
            >
              <Button type="submit" className="w-full" size="lg">
                Continuar com Google
              </Button>
            </form>
          ) : null}
          {hasApple ? (
            <form
              action={async () => {
                "use server";
                await signInWithApple(callbackUrl);
              }}
            >
              <Button type="submit" variant="secondary" className="w-full" size="lg">
                Continuar com Apple
              </Button>
            </form>
          ) : null}
          {!hasAnyProvider ? (
            <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              Login ainda não configurado. Na Vercel, defina{" "}
              <code className="text-xs">AUTH_LOGIN_EMAIL</code> e{" "}
              <code className="text-xs">AUTH_LOGIN_PASSWORD</code> (ou OAuth
              Google/Apple).
            </p>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
