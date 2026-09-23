"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Início" },
  { href: "/plantas", label: "Plantas" },
];

function NavLinks({ pathname, className }: { pathname: string; className?: string }) {
  return (
    <nav
      className={cn(
        "flex gap-1 rounded-2xl border border-[var(--border)] bg-[var(--nav-pill)] p-1 shadow-sm sm:rounded-full",
        className,
      )}
      aria-label="Principal"
    >
      {links.map((l) => {
        const active =
          l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-xl px-3 py-2.5 text-center text-sm font-medium transition sm:rounded-full sm:px-4 sm:py-1.5",
              active
                ? "bg-[var(--nav-active)] text-[var(--background)] shadow-sm dark:text-[#1a1412]"
                : "text-[var(--muted)] hover:bg-[var(--card-elevated)] hover:text-[var(--foreground)]",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md pt-[env(safe-area-inset-top)]"
    >
      <div className="mx-auto max-w-5xl px-3 sm:px-6">
        {/* Desktop: uma linha — logo à esquerda, ações + nav à direita */}
        <div className="hidden min-w-0 items-center justify-between gap-4 py-3 sm:flex">
          <Link
            href="/"
            className="group flex min-w-0 shrink items-center gap-2.5"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c45c4a] to-[#8f3d32] text-white shadow-md shadow-[#8f3d32]/25 transition group-hover:shadow-lg"
            >
              <Sprout className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-semibold leading-none text-[var(--foreground)]">
                Caudexia
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                Rosa do deserto
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <SignOutButton />
            <ThemeToggle />
            <NavLinks pathname={pathname} className="ml-1" />
          </div>
        </div>

        {/* Mobile: logo + utilitários; nav em largura total abaixo */}
        <div className="flex flex-col gap-2 py-2.5 sm:hidden">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <Link href="/" className="group flex min-w-0 items-center gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c45c4a] to-[#8f3d32] text-white shadow-md"
              >
                <Sprout className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="truncate font-display text-base font-semibold text-[var(--foreground)]">
                Caudexia
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-1.5">
              <SignOutButton />
              <ThemeToggle />
            </div>
          </div>
          <NavLinks pathname={pathname} className="w-full [&_a]:flex-1" />
        </div>
      </div>
    </header>
  );
}
