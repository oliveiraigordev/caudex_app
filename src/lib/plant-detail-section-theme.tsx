import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Bell, Flower2, History, Images, Sprout, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlantDetailSectionKey =
  | "dados"
  | "registrar"
  | "polinizacao"
  | "alertas"
  | "timeline"
  | "galeria";

type SectionTheme = {
  cardClass: string;
  darkCardClass: string;
  iconClass: string;
  darkIconClass: string;
  Icon: LucideIcon;
};

export const plantDetailSectionTheme: Record<PlantDetailSectionKey, SectionTheme> =
  {
    dados: {
      cardClass:
        "border-[#c4d4bc]/70 bg-gradient-to-br from-[#eef5ea]/90 to-[var(--card)]",
      darkCardClass:
        "dark:border-emerald-900/40 dark:from-emerald-950/35 dark:to-[var(--card)]",
      iconClass: "text-emerald-800",
      darkIconClass: "dark:text-emerald-300",
      Icon: Sprout,
    },
    registrar: {
      cardClass:
        "border-sky-200/60 bg-gradient-to-br from-sky-50/70 to-[var(--card)]",
      darkCardClass:
        "dark:border-sky-900/35 dark:from-sky-950/30 dark:to-[var(--card)]",
      iconClass: "text-sky-800",
      darkIconClass: "dark:text-sky-300",
      Icon: Zap,
    },
    polinizacao: {
      cardClass:
        "border-pink-200/50 bg-gradient-to-br from-pink-50/40 to-[var(--card)]",
      darkCardClass:
        "dark:border-pink-900/35 dark:from-pink-950/25 dark:to-[var(--card)]",
      iconClass: "text-pink-700",
      darkIconClass: "dark:text-pink-300",
      Icon: Flower2,
    },
    alertas: {
      cardClass:
        "border-amber-200/55 bg-gradient-to-br from-amber-50/50 to-[var(--card)]",
      darkCardClass:
        "dark:border-amber-900/35 dark:from-amber-950/25 dark:to-[var(--card)]",
      iconClass: "text-amber-800",
      darkIconClass: "dark:text-amber-300",
      Icon: Bell,
    },
    timeline: {
      cardClass:
        "border-stone-300/50 bg-gradient-to-br from-stone-100/60 to-[var(--card)]",
      darkCardClass:
        "dark:border-stone-600/30 dark:from-stone-900/40 dark:to-[var(--card)]",
      iconClass: "text-stone-700",
      darkIconClass: "dark:text-stone-300",
      Icon: History,
    },
    galeria: {
      cardClass:
        "border-[#d4a088]/40 bg-gradient-to-br from-[#f8ebe3]/50 to-[var(--card)]",
      darkCardClass:
        "dark:border-[#8f5a45]/40 dark:from-[#3d2a24]/50 dark:to-[var(--card)]",
      iconClass: "text-[#c45c4a]",
      darkIconClass: "dark:text-[#e89a8a]",
      Icon: Images,
    },
  };

export function PlantSectionTitle({
  section,
  children,
}: {
  section: PlantDetailSectionKey;
  children: ReactNode;
}) {
  const { Icon, iconClass, darkIconClass } = plantDetailSectionTheme[section];
  return (
    <span className="flex items-center gap-2">
      <Icon
        className={cn("h-4 w-4 shrink-0", iconClass, darkIconClass)}
        aria-hidden
      />
      {children}
    </span>
  );
}

export function plantDetailCardClass(section: PlantDetailSectionKey) {
  const t = plantDetailSectionTheme[section];
  return cn(t.cardClass, t.darkCardClass);
}
