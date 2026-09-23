"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/80 text-[var(--muted)] shadow-sm transition hover:text-[var(--foreground)]"
      title="Sair"
      aria-label="Sair da conta"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
