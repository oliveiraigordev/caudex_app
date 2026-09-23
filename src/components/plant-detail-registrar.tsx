"use client";

import { CollapsibleCard } from "@/components/collapsible-card";
import { QuickEventButtons } from "@/components/quick-event-buttons";
import {
  plantDetailCardClass,
  PlantSectionTitle,
} from "@/lib/plant-detail-section-theme";

export function PlantDetailRegistrar({
  plantId,
  potPreset,
}: {
  plantId: string;
  potPreset?: string | null;
}) {
  return (
    <CollapsibleCard
      className={plantDetailCardClass("registrar")}
      title={
        <PlantSectionTitle section="registrar">Registrar agora</PlantSectionTitle>
      }
      description="Rega, adubação, replantio, foto e outros eventos rápidos."
      defaultOpenDesktop
      defaultOpenMobile={false}
    >
      <QuickEventButtons plantId={plantId} currentPotPreset={potPreset} />
    </CollapsibleCard>
  );
}
