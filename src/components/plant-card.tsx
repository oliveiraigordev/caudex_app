import Link from "next/link";
import Image from "next/image";
import type { Plant, PlantEvent, PlantPhoto, CultivationLocation } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { phaseLabels, statusLabels } from "@/lib/labels";
import { formatPlantPot } from "@/lib/pot-sizes";
import { daysSince, formatDate } from "@/lib/utils";
import { ChevronRight, Droplets } from "lucide-react";

type PlantCardProps = {
  plant: Plant & {
    events: PlantEvent[];
    photos: PlantPhoto[];
    location: CultivationLocation | null;
  };
};

export function PlantCard({ plant }: PlantCardProps) {
  const lastWater = plant.events.find((e) => e.type === "REGA");
  const waterDays = daysSince(lastWater?.occurredAt);
  const cover = plant.photos[0]?.path;
  const potLabel = formatPlantPot(plant);

  return (
    <Link href={`/plantas/${plant.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-stone-200/60 transition duration-300 hover:-translate-y-0.5 hover:border-[#d4a088]/50 hover:shadow-lg hover:shadow-stone-400/15">
        <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-[#f8ebe3] to-[#efe4d4]">
          {cover ? (
            <Image
              src={cover}
              alt={plant.code}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-stone-400">
              <span className="text-3xl opacity-40">✿</span>
              <span className="text-xs font-medium">Adicionar foto</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-4 pb-3 pt-12">
            <p className="font-display text-lg font-semibold text-white">
              {plant.code}
            </p>
            <p className="text-sm text-white/85">
              {plant.nickname ?? "Sem apelido"}
            </p>
          </div>
          <Badge
            className="absolute right-3 top-3 border-0 bg-white/90 text-[#7a3d32] shadow-sm backdrop-blur-sm"
            variant="default"
          >
            {phaseLabels[plant.phase]}
          </Badge>
        </div>
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-stone-600">
            <span>{statusLabels[plant.status]}</span>
            <span className="text-stone-300">·</span>
            <span>{plant.heightCm ? `${plant.heightCm} cm` : "—"}</span>
            {potLabel && (
              <>
                <span className="text-stone-300">·</span>
                <span>{potLabel}</span>
              </>
            )}
            {plant.location && (
              <>
                <span className="text-stone-300">·</span>
                <span>{plant.location.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-stone-500">
              <Droplets className="h-3.5 w-3.5 text-[#6ba3b5]" />
              {lastWater
                ? `${formatDate(lastWater.occurredAt)} · ${waterDays}d`
                : "Sem rega registrada"}
            </span>
            <ChevronRight
              className="h-4 w-4 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-[#c45c4a]"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
