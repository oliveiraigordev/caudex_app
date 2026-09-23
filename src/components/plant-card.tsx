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
      <Card className="h-full overflow-hidden border-stone-200/60 transition duration-300 hover:-translate-y-0.5 hover:border-[#d4a088]/50 hover:shadow-lg hover:shadow-stone-400/15 sm:hover:-translate-y-0.5">
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#f8ebe3] to-[#efe4d4] sm:aspect-[5/4]">
          {cover ? (
            <Image
              src={cover}
              alt={plant.code}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-0.5 text-stone-400">
              <span className="text-xl opacity-40 sm:text-3xl">✿</span>
              <span className="text-[10px] font-medium sm:text-xs">Foto</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-2 pb-2 pt-8 sm:px-4 sm:pb-3 sm:pt-12">
            <p className="truncate font-display text-sm font-semibold text-white sm:text-lg">
              {plant.code}
            </p>
            <p className="hidden truncate text-sm text-white/85 sm:block">
              {plant.nickname ?? "Sem apelido"}
            </p>
          </div>
          <Badge
            className="absolute right-1.5 top-1.5 max-w-[5.5rem] truncate border-0 bg-white/90 px-1.5 py-0 text-[10px] text-[#7a3d32] shadow-sm backdrop-blur-sm sm:right-3 sm:top-3 sm:max-w-none sm:px-2.5 sm:py-0.5 sm:text-xs"
            variant="default"
          >
            {phaseLabels[plant.phase]}
          </Badge>
        </div>
        <CardContent className="space-y-1.5 px-2.5 pb-2.5 pt-2 sm:space-y-3 sm:p-5 sm:pt-4">
          <div className="hidden flex-wrap gap-x-2 gap-y-1 text-xs text-stone-600 sm:flex">
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
          <div className="flex items-center justify-between gap-1 text-[10px] sm:gap-2 sm:text-xs">
            <span className="flex min-w-0 items-center gap-1 text-stone-500 sm:gap-1.5">
              <Droplets className="h-3 w-3 shrink-0 text-[#6ba3b5] sm:h-3.5 sm:w-3.5" />
              <span className="truncate">
                {lastWater
                  ? (
                    <>
                      <span className="sm:hidden">{waterDays}d rega</span>
                      <span className="hidden sm:inline">
                        {formatDate(lastWater.occurredAt)} · {waterDays}d
                      </span>
                    </>
                  )
                  : "Sem rega"}
              </span>
            </span>
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-[#c45c4a] sm:h-4 sm:w-4"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
