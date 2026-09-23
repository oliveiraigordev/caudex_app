import type { AlertLevel } from "@/lib/alerts";
import type { LucideIcon } from "lucide-react";
import {
  CloudRain,
  Droplets,
  FlaskConical,
  Snowflake,
  Sun,
  Umbrella,
} from "lucide-react";

export type AlertRuleId =
  | "RAIN_SHELTER"
  | "SKIP_WATER"
  | "WATER_DUE"
  | "FERT_DUE"
  | "COLD_PROTECT"
  | "HIGH_UV";

type AlertMeta = {
  label: string;
  icon: LucideIcon;
};

export const alertRuleMeta: Record<AlertRuleId, AlertMeta> = {
  RAIN_SHELTER: { label: "Abrigar da chuva", icon: Umbrella },
  SKIP_WATER: { label: "Evitar rega hoje", icon: CloudRain },
  WATER_DUE: { label: "Verificar rega", icon: Droplets },
  FERT_DUE: { label: "Adubação", icon: FlaskConical },
  COLD_PROTECT: { label: "Proteger do frio", icon: Snowflake },
  HIGH_UV: { label: "Sol intenso", icon: Sun },
};

export function getAlertMeta(ruleId: string): AlertMeta {
  return (
    alertRuleMeta[ruleId as AlertRuleId] ?? {
      label: "Lembrete",
      icon: Droplets,
    }
  );
}

export function alertLevelLabel(level: AlertLevel): string {
  switch (level) {
    case "urgent":
      return "Urgente";
    case "warning":
      return "Atenção";
    default:
      return "Sugestão";
  }
}

export function sortAlerts<T extends { level: AlertLevel }>(alerts: T[]): T[] {
  const order: Record<AlertLevel, number> = {
    urgent: 0,
    warning: 1,
    info: 2,
  };
  return [...alerts].sort((a, b) => order[a.level] - order[b.level]);
}

/** Agrupa alertas repetitivos na home (ex.: vários “não regar”). */
export function summarizeAlertsForHome(
  alerts: import("@/lib/alerts").AppAlert[],
  limit = 5,
) {
  const sorted = sortAlerts(alerts);
  const picked: import("@/lib/alerts").AppAlert[] = [];
  const seenRules = new Set<string>();

  for (const a of sorted) {
    const key = `${a.ruleId}-${a.level}`;
    if (a.plantCode && (a.ruleId === "SKIP_WATER" || a.ruleId === "WATER_DUE")) {
      // um por planta
      if (picked.some((p) => p.id === a.id)) continue;
    } else if (!a.plantCode && seenRules.has(key)) {
      continue;
    }
    picked.push(a);
    if (!a.plantCode) seenRules.add(key);
    if (picked.length >= limit) break;
  }
  return { items: picked, total: alerts.length };
}
