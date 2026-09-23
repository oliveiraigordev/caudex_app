import type { AppAlert } from "@/lib/alerts";
import { splitAlertsByBucket } from "@/lib/alert-buckets";

export function buildPushPayload(alerts: AppAlert[]) {
  const { today, ongoing } = splitAlertsByBucket(alerts);
  const priority = [...today, ...ongoing];

  if (priority.length === 0) {
    return null;
  }

  const headline = today.length > 0
    ? `${today.length} lembrete${today.length > 1 ? "s" : ""} para hoje`
    : `${ongoing.length} para acompanhar no viveiro`;

  const lines = priority.slice(0, 4).map((a) => a.title);
  const more = priority.length > 4 ? `\n+${priority.length - 4} mais` : "";

  return {
    title: "Caudexia",
    body: `${headline}\n${lines.join(" · ")}${more}`,
    url: "/",
    tag: "caudexia-lembretes",
    count: priority.length,
  };
}
