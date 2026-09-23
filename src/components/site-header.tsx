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

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md pt-[env(safe-area-inset-top)]"
    >
      <div className="mx-auto max-w-5xl px-3 sm:px-6">
        <div className="flex min-w-0 items-center justify-between gap-2 py-2.5 sm:py-3">
          <Link
            href="/"
            className="group flex min-w-0 shrink items-center gap-2"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c45c4a] to-[#8f3d32] text-white shadow-md shadow-[#8f3d32]/25 transition group-hover:shadow-lg"
            >
              <Sprout className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold leading-none text-[var(--foreground)] sm:text-lg">
                Caudexia
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)] sm:inline">
                Rosa do deserto
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <SignOutButton />
            <ThemeToggle />
          </div>
        </div>

        <nav
          className="-mx-1 mb-2 flex gap-1 rounded-2xl border border-[var(--border)] bg-[var(--nav-pill)] p-1 shadow-sm sm:mx-0 sm:mb-3 sm:inline-flex sm:w-auto"
          aria-label="Principal"
        >
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-medium transition sm:flex-none sm:rounded-full sm:px-5 sm:py-1.5",
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
      </div>
    </header>
  );
}
