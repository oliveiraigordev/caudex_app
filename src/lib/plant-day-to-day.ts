import type { Plant, PlantEvent, CultivationLocation } from "@prisma/client";
import { formatPlantPot } from "@/lib/pot-sizes";
import { daysSince } from "@/lib/utils";

export type PlantWithEvents = Plant & {
  events: PlantEvent[];
  location: CultivationLocation | null;
};

export function lastEventOfType(events: PlantEvent[], type: PlantEvent["type"]) {
  return events.find((e) => e.type === type);
}

export type PlantDayToDayRow = {
  id: string;
  code: string;
  nickname: string | null;
  phase: Plant["phase"];
  status: Plant["status"];
  heightCm: number | null;
  locationName: string;
  potLabel: string;
  lastWaterAt: Date | null;
  waterDays: number | null;
  lastFertAt: Date | null;
  fertDays: number | null;
};

export function plantDayToDaySummary(plant: PlantWithEvents): PlantDayToDayRow {
  const lastWater = lastEventOfType(plant.events, "REGA");
  const lastFert = lastEventOfType(plant.events, "ADUBACAO");

  return {
    id: plant.id,
    code: plant.code,
    nickname: plant.nickname,
    phase: plant.phase,
    status: plant.status,
    heightCm: plant.heightCm,
    locationName: plant.location?.name ?? "—",
    potLabel: formatPlantPot(plant) ?? "—",
    lastWaterAt: lastWater?.occurredAt ?? null,
    waterDays: lastWater ? daysSince(lastWater.occurredAt) : null,
    lastFertAt: lastFert?.occurredAt ?? null,
    fertDays: lastFert ? daysSince(lastFert.occurredAt) : null,
  };
}
