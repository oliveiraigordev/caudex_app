"use client";

import { useState, useTransition } from "react";
import { signInWithCredentials } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export function LoginCredentialsForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") ?? "");
        const password = String(fd.get("password") ?? "");
        startTransition(async () => {
          const res = await signInWithCredentials(email, password, callbackUrl);
          if (res?.error) setError(res.error);
        });
      }}
    >
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[var(--foreground)]">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[#c45c4a]/30 focus:ring-2"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[var(--foreground)]">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none ring-[#c45c4a]/30 focus:ring-2"
        />
      </div>
      {error ? (
        <p className="text-sm text-[#b84a3f]" role="alert">{error}</p>
      ) : null}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
