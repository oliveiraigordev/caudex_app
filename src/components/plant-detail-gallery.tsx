"use client";

import Image from "next/image";
import { CollapsibleCard } from "@/components/collapsible-card";
import {
  plantDetailCardClass,
  PlantSectionTitle,
} from "@/lib/plant-detail-section-theme";

type Photo = {
  id: string;
  path: string;
  caption: string | null;
};

export function PlantDetailGallery({
  photos,
  plantCode,
}: {
  photos: Photo[];
  plantCode: string;
}) {
  if (photos.length === 0) return null;

  return (
    <CollapsibleCard
      className={plantDetailCardClass("galeria")}
      title={<PlantSectionTitle section="galeria">Galeria</PlantSectionTitle>}
      description={`${photos.length} foto${photos.length === 1 ? "" : "s"} desta muda.`}
      defaultOpenDesktop
      defaultOpenMobile={false}
      collapsibleDesktop={false}
      collapsibleMobile
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-stone-200/80"
          >
            <Image
              src={photo.path}
              alt={photo.caption ?? plantCode}
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
