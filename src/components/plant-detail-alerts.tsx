"use client";

import { CollapsibleCard } from "@/components/collapsible-card";
import { AlertsSection } from "@/components/alerts-section";
import type { AppAlert } from "@/lib/alerts";
import {
  plantDetailCardClass,
  PlantSectionTitle,
} from "@/lib/plant-detail-section-theme";

export function PlantDetailAlerts({
  alerts,
  dismissedCount,
  completedAlerts,
}: {
  alerts: AppAlert[];
  dismissedCount: number;
  completedAlerts: AppAlert[];
}) {
  return (
    <CollapsibleCard
      className={plantDetailCardClass("alertas")}
      title={
        <PlantSectionTitle section="alertas">Para esta muda</PlantSectionTitle>
      }
      description="Lembretes e alertas só desta planta."
      defaultOpenDesktop
      defaultOpenMobile
      collapsibleDesktop={false}
      collapsibleMobile
    >
      <AlertsSection
        alerts={alerts}
        dismissedCount={dismissedCount}
        completedAlerts={completedAlerts}
      />
    </CollapsibleCard>
  );
}
