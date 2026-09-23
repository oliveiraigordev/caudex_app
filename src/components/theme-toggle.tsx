"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readThemeFromDocument, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readThemeFromDocument());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/80 text-[var(--foreground)] shadow-sm transition hover:bg-[var(--card)]",
        className,
      )}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-300" strokeWidth={2} />
      ) : (
        <Moon className="h-4 w-4 text-[#8f3d32]" strokeWidth={2} />
      )}
    </button>
  );
}
