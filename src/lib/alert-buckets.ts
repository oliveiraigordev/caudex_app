import type { AppAlert } from "@/lib/alerts";
import { sortAlerts } from "@/lib/alert-labels";

export type AlertBucket = "today" | "ongoing";

export const alertBucketMeta: Record<
  AlertBucket,
  { title: string; description: string }
> = {
  today: {
    title: "Para hoje",
    description:
      "Clima e cuidados do dia — os feitos zeram à meia-noite (horário de Brasília)",
  },
  ongoing: {
    title: "Para acompanhar",
    description: "Rega, adubo e conferências da sua rotina no viveiro",
  },
};

const todayRuleIds = new Set([
  "RAIN_SHELTER",
  "SKIP_WATER",
  "COLD_PROTECT",
  "HIGH_UV",
]);

export function getAlertBucket(alert: AppAlert): AlertBucket {
  if (todayRuleIds.has(alert.ruleId)) return "today";
  if (alert.level === "urgent" || alert.level === "warning") return "today";
  return "ongoing";
}

export function splitAlertsByBucket(alerts: AppAlert[]) {
  const today: AppAlert[] = [];
  const ongoing: AppAlert[] = [];
  for (const alert of alerts) {
    (getAlertBucket(alert) === "today" ? today : ongoing).push(alert);
  }
  return {
    today: sortAlerts(today),
    ongoing: sortAlerts(ongoing),
  };
}
