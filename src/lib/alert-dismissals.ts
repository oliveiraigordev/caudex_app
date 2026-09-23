import { prisma } from "@/lib/db";
import type { AppAlert } from "@/lib/alerts";
import { getAlertBucket } from "@/lib/alert-buckets";

const TZ = "America/Sao_Paulo";

export function todayInTz(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: TZ });
}

function dismissedToday(dismissedAt: Date): boolean {
  const day = dismissedAt.toLocaleDateString("sv-SE", { timeZone: TZ });
  return day === todayInTz();
}

/** Chave no banco: “Para hoje” inclui a data e zera à meia-noite (Brasília). */
export function getDismissalStorageKey(alert: AppAlert): string {
  if (getAlertBucket(alert) === "today") {
    return `${alert.id}@${todayInTz()}`;
  }
  return alert.id;
}

/** Remove chaves @data de dias anteriores. */
export async function purgeStaleTodayDismissals() {
  const today = todayInTz();
  const rows = await prisma.alertDismissal.findMany();
  const staleIds = rows
    .filter((row) => {
      const m = row.alertKey.match(/@(\d{4}-\d{2}-\d{2})$/);
      return m && m[1] !== today;
    })
    .map((r) => r.id);
  if (staleIds.length > 0) {
    await prisma.alertDismissal.deleteMany({ where: { id: { in: staleIds } } });
  }
}

export async function getDismissedAlertIds(
  alerts: AppAlert[],
): Promise<Set<string>> {
  await purgeStaleTodayDismissals();
  const rows = await prisma.alertDismissal.findMany();
  const today = todayInTz();
  const dismissed = new Set<string>();

  for (const alert of alerts) {
    if (getAlertBucket(alert) === "today") {
      const key = `${alert.id}@${today}`;
      if (rows.some((r) => r.alertKey === key)) {
        dismissed.add(alert.id);
      }
    } else if (rows.some((r) => r.alertKey === alert.id)) {
      dismissed.add(alert.id);
    }
  }
  return dismissed;
}

export function filterActiveAlerts(
  alerts: AppAlert[],
  dismissedIds: Set<string>,
): AppAlert[] {
  return alerts.filter((a) => !dismissedIds.has(a.id));
}

export async function dismissAlertKeys(keys: string[]) {
  for (const key of keys) {
    await prisma.alertDismissal.upsert({
      where: { alertKey: key },
      update: { dismissedAt: new Date() },
      create: { alertKey: key },
    });
  }
}

export async function dismissAlerts(alerts: AppAlert[]) {
  const keys = alerts.map(getDismissalStorageKey);
  await dismissAlertKeys(keys);
}

export async function dismissAlertById(
  alertId: string,
  allAlerts: AppAlert[],
) {
  const alert = allAlerts.find((a) => a.id === alertId);
  if (!alert) return;
  await dismissAlertKeys([getDismissalStorageKey(alert)]);
}

export async function restoreAllDismissalsToday() {
  const rows = await prisma.alertDismissal.findMany();
  const today = todayInTz();
  const toDelete = rows.filter((row) => {
    if (dismissedToday(row.dismissedAt)) return true;
    if (row.alertKey.endsWith(`@${today}`)) return true;
    return false;
  });
  if (toDelete.length === 0) return;
  await prisma.alertDismissal.deleteMany({
    where: { id: { in: toDelete.map((r) => r.id) } },
  });
}

export async function countDismissedAmong(
  allAlerts: AppAlert[],
  activeAlerts: AppAlert[],
): Promise<number> {
  return allAlerts.length - activeAlerts.length;
}
