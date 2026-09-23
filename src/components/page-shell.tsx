import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className = "",
  narrow = false,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div className="relative min-h-full overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[var(--background)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.55] dark:opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, var(--glow-warm), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, var(--glow-gold), transparent)
          `,
        }}
        aria-hidden
      />
      <SiteHeader />
      <main
        className={cn(
          "mx-auto min-w-0 w-full max-w-full px-4 pb-16 pt-6 sm:px-6",
          narrow ? "max-w-lg" : "max-w-5xl",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
