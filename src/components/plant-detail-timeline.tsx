"use client";

import { CollapsibleCard } from "@/components/collapsible-card";
import { EventTimeline } from "@/components/event-timeline";
import type { PlantEvent, PlantPhoto } from "@prisma/client";
import {
  plantDetailCardClass,
  PlantSectionTitle,
} from "@/lib/plant-detail-section-theme";

type EventWithPhotos = PlantEvent & { photos: PlantPhoto[] };

export function PlantDetailTimeline({
  events,
  plantId,
}: {
  events: EventWithPhotos[];
  plantId: string;
}) {
  return (
    <CollapsibleCard
      className={plantDetailCardClass("timeline")}
      title={
        <PlantSectionTitle section="timeline">Linha do tempo</PlantSectionTitle>
      }
      description="Rega, replantio, fotos e demais eventos."
      defaultOpenDesktop
      defaultOpenMobile={false}
      collapsibleDesktop={false}
      collapsibleMobile
    >
      <EventTimeline events={events} plantId={plantId} />
    </CollapsibleCard>
  );
}
