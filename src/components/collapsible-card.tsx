"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useIsLgDesktop } from "@/hooks/use-media-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type CollapsibleCardProps = {
  title: ReactNode;
  description?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Aberto por padrão em telas ≥ lg */
  defaultOpenDesktop: boolean;
  /** Aberto por padrão em telas &lt; lg */
  defaultOpenMobile: boolean;
  /** Se false, sempre aberto no desktop (sem botão) */
  collapsibleDesktop?: boolean;
  /** Se false, sempre aberto no mobile (sem botão) */
  collapsibleMobile?: boolean;
};

export function CollapsibleCard({
  title,
  description,
  headerActions,
  children,
  className,
  contentClassName,
  defaultOpenDesktop,
  defaultOpenMobile,
  collapsibleDesktop = true,
  collapsibleMobile = true,
}: CollapsibleCardProps) {
  const isLg = useIsLgDesktop();
  const collapsible = isLg ? collapsibleDesktop : collapsibleMobile;
  const defaultOpen = isLg ? defaultOpenDesktop : defaultOpenMobile;

  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(isLg ? defaultOpenDesktop : defaultOpenMobile);
  }, [isLg, defaultOpenDesktop, defaultOpenMobile]);

  const showBody = !collapsible || open;

  return (
    <Card className={className}>
      <CardHeader className="space-y-0">
        <div className="flex flex-wrap items-start gap-2">
          {collapsible ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="-ml-1 flex min-w-0 flex-1 basis-[min(100%,12rem)] items-start gap-2 rounded-lg py-0.5 text-left transition hover:bg-[var(--card-elevated)]/60"
              aria-expanded={open}
            >
              <ChevronDown
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0 text-stone-500 transition-transform",
                  open && "rotate-180",
                )}
              />
              <CardTitle className="min-w-0 text-base leading-snug">{title}</CardTitle>
            </button>
          ) : (
            <CardTitle className="min-w-0 flex-1 text-base leading-snug">{title}</CardTitle>
          )}
          {headerActions ? (
            <div
              className="ml-auto shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {headerActions}
            </div>
          ) : null}
        </div>
        {description ? (
          <p
            className={cn(
              "pt-2 text-xs leading-relaxed text-stone-600",
              collapsible ? "pl-7" : "",
              collapsible && !open && "line-clamp-2 text-stone-500",
              collapsible && open && "break-words",
            )}
          >
            {description}
          </p>
        ) : null}
      </CardHeader>
      {showBody ? (
        <CardContent className={contentClassName}>{children}</CardContent>
      ) : null}
    </Card>
  );
}
