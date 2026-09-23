"use client";

import { useState, useTransition, type ReactNode } from "react";
import type { AppAlert } from "@/lib/alerts";
import { AlertBucketEmpty, AlertItem, AlertList } from "@/components/alert-list";
import { Button } from "@/components/ui/button";
import {
  dismissAlert,
  dismissAllAlerts,
  restoreDismissedAlerts,
} from "@/app/actions";
import {
  alertBucketMeta,
  splitAlertsByBucket,
  type AlertBucket,
} from "@/lib/alert-buckets";
import { CheckCheck, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertsSectionProps = {
  alerts: AppAlert[];
  dismissedCount: number;
  completedAlerts: AppAlert[];
};

function CollapsibleBucket({
  title,
  description,
  defaultOpen,
  count,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen: boolean;
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card-elevated)]/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-2 rounded-xl px-3 py-3 text-left transition hover:bg-[var(--card-elevated)]/60"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 text-[var(--muted)] transition-transform",
            open && "rotate-180",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-[var(--foreground)]">
              {title}
            </h3>
            <span className="rounded-full bg-[var(--card)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
              {count}
            </span>
          </div>
          {description ? (
            <p
              className={cn(
                "mt-0.5 text-xs text-[var(--muted)]",
                !open && "truncate",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      </button>
      {open ? <div className="space-y-2 px-3 pb-3 pt-0">{children}</div> : null}
    </section>
  );
}

function BucketItems({
  bucket,
  items,
  pending,
  onCheck,
}: {
  bucket: AlertBucket;
  items: AppAlert[];
  pending: boolean;
  onCheck: (id: string) => void;
}) {
  if (items.length === 0) {
    return <AlertBucketEmpty bucket={bucket} />;
  }
  return (
    <ul className="space-y-2">
      {items.map((alert) => (
        <li key={alert.id}>
          <AlertItem
            alert={alert}
            compact
            checkPending={pending}
            onCheck={() => onCheck(alert.id)}
          />
        </li>
      ))}
    </ul>
  );
}

export function AlertsSection({
  alerts,
  dismissedCount,
  completedAlerts,
}: AlertsSectionProps) {
  const [pending, startTransition] = useTransition();
  const { today, ongoing } = splitAlertsByBucket(alerts);

  function check(id: string) {
    startTransition(async () => {
      await dismissAlert(id);
    });
  }

  const allEmpty =
    today.length === 0 && ongoing.length === 0 && completedAlerts.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {alerts.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await dismissAllAlerts();
              })
            }
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todos como feitos
          </Button>
        )}
        {dismissedCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await restoreDismissedAlerts();
              })
            }
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Desfazer feitos ({dismissedCount})
          </Button>
        )}
      </div>

      {allEmpty ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 px-4 py-8 text-center text-sm text-[var(--muted)]">
          Nenhum lembrete ativo. Registre regas ou use &quot;Desfazer feitos&quot;
          para rever o que marcou hoje.
        </p>
      ) : (
        <div className="space-y-3">
          <CollapsibleBucket
            title={alertBucketMeta.today.title}
            description={alertBucketMeta.today.description}
            defaultOpen
            count={today.length}
          >
            <BucketItems
              bucket="today"
              items={today}
              pending={pending}
              onCheck={check}
            />
          </CollapsibleBucket>

          <CollapsibleBucket
            title={alertBucketMeta.ongoing.title}
            description={alertBucketMeta.ongoing.description}
            defaultOpen
            count={ongoing.length}
          >
            <BucketItems
              bucket="ongoing"
              items={ongoing}
              pending={pending}
              onCheck={check}
            />
          </CollapsibleBucket>

          <CollapsibleBucket
            title="Feitos hoje"
            description='Voltam amanhã se ainda fizerem sentido, ou use "Desfazer feitos".'
            defaultOpen={false}
            count={completedAlerts.length}
          >
            {completedAlerts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-3 py-4 text-center text-sm text-[var(--muted)]">
                Nada marcado como feito hoje ainda.
              </p>
            ) : (
              <AlertList alerts={completedAlerts} compact completed />
            )}
          </CollapsibleBucket>
        </div>
      )}
    </div>
  );
}
