import type { AppAlert } from "@/lib/alerts";
import {
  alertLevelLabel,
  getAlertMeta,
  sortAlerts,
} from "@/lib/alert-labels";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const levelStyles: Record<
  AppAlert["level"],
  { box: string; chip: string }
> = {
  urgent: {
    box:
      "border-red-200/80 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/40",
    chip: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
  },
  warning: {
    box:
      "border-amber-200/80 bg-amber-50/90 dark:border-amber-900/45 dark:bg-amber-950/35",
    chip:
      "bg-amber-100 text-amber-900 dark:bg-amber-900/45 dark:text-amber-100",
  },
  info: {
    box:
      "border-teal-200/60 bg-white/80 dark:border-teal-900/40 dark:bg-[var(--card-elevated)]",
    chip: "bg-teal-50 text-teal-900 dark:bg-teal-900/35 dark:text-teal-100",
  },
};

export function AlertItem({
  alert,
  compact = false,
  onCheck,
  checkPending = false,
  completed = false,
}: {
  alert: AppAlert;
  compact?: boolean;
  onCheck?: () => void;
  checkPending?: boolean;
  completed?: boolean;
}) {
  const meta = getAlertMeta(alert.ruleId);
  const Icon = meta.icon;
  const s = levelStyles[alert.level];

  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full gap-3 rounded-2xl border p-3.5 shadow-sm shadow-stone-200/40",
        completed ? "border-stone-200 bg-stone-50/90 opacity-75" : s.box,
        compact && "p-3",
      )}
    >
      {onCheck && !completed && (
        <button
          type="button"
          disabled={checkPending}
          onClick={onCheck}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-stone-300 bg-white text-transparent transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
          aria-label="Marcar lembrete como feito"
          title="Marcar como feito"
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </button>
      )}
      {completed && (
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
          aria-hidden
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </div>
      )}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-[#9b4d3a] shadow-inner",
          completed && "opacity-60",
        )}
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          {!completed && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                s.chip,
              )}
            >
              {alertLevelLabel(alert.level)}
            </span>
          )}
          {completed && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
              Feito
            </span>
          )}
          <span className="text-xs font-medium text-stone-500">{meta.label}</span>
        </div>
        <p
          className={cn(
            "mt-1 break-words text-sm font-semibold leading-snug text-stone-900",
            completed && "line-through decoration-stone-400",
          )}
        >
          {alert.title}
        </p>
        <p className="mt-0.5 break-words text-sm leading-relaxed text-stone-600">
          {alert.message}
        </p>
      </div>
    </div>
  );
}

export function AlertList({
  alerts,
  compact = false,
  completed = false,
}: {
  alerts: AppAlert[];
  compact?: boolean;
  completed?: boolean;
}) {
  if (alerts.length === 0) {
    return null;
  }

  const sorted = sortAlerts(alerts);

  return (
    <ul className={cn("space-y-2", compact && "space-y-1.5")}>
      {sorted.map((alert) => (
        <li key={alert.id}>
          <AlertItem alert={alert} compact={compact} completed={completed} />
        </li>
      ))}
    </ul>
  );
}

export function AlertBucketEmpty({ bucket }: { bucket: "today" | "ongoing" }) {
  const text =
    bucket === "today"
      ? "Nada urgente para hoje — aproveite o viveiro com calma."
      : "Nenhuma pendência de rotina no momento.";
  return (
    <p className="rounded-xl border border-dashed border-stone-200/80 bg-white/40 px-3 py-4 text-center text-sm text-stone-500">
      {text}
    </p>
  );
}
