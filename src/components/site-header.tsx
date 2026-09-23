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
      className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-md"
    >
      <div className="mx-auto flex min-w-0 max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 shrink items-center gap-2 sm:gap-2.5"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#c45c4a] to-[#8f3d32] text-white shadow-md shadow-[#8f3d32]/25 transition group-hover:shadow-lg"
          >
            <Sprout className="h-5 w-5" strokeWidth={2} />
          </span>
          <span>
            <span className="block font-display text-lg font-semibold leading-none text-[var(--foreground)]">
              Caudexia
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)] sm:inline">
              Rosa do deserto
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SignOutButton />
          <ThemeToggle />
          <nav
            className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--nav-pill)] p-1 shadow-sm"
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
                    "rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4",
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
      </div>
    </header>
  );
}
