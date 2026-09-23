"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { uploadPlantPhoto } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlantHeroBanner({
  plantId,
  heroPhotoPath,
  code,
  nickname,
  phaseLabel,
  statusLabel,
  originLabel,
}: {
  plantId: string;
  heroPhotoPath: string | null;
  code: string;
  nickname: string | null;
  phaseLabel: string;
  statusLabel: string;
  originLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("plantId", plantId);
    fd.set("file", file);
    fd.set("caption", "Capa da muda");
    startTransition(async () => {
      await uploadPlantPhoto(fd);
      e.target.value = "";
    });
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200/70 bg-[var(--card)] shadow-md shadow-stone-300/20">
      <div className="relative aspect-[4/3] min-h-[160px] bg-gradient-to-br from-[#f0ddd4] to-[#e8d5c4] sm:aspect-[21/9] sm:min-h-[140px] md:aspect-[3/1]">
        {heroPhotoPath ? (
          <Image
            src={heroPhotoPath}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#3d2c29]/75 via-[#3d2c29]/25 to-transparent" />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-hidden
          onChange={onFileChange}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white shadow-lg backdrop-blur-md transition",
            "hover:bg-black/50 active:scale-95 disabled:opacity-60",
          )}
          aria-label={pending ? "Enviando foto…" : "Definir foto da capa"}
          title="Foto da capa"
        >
          <Camera className="h-5 w-5" strokeWidth={2} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {code}
          </p>
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {nickname ?? code}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="bg-white/20 text-white backdrop-blur-sm">
              {phaseLabel}
            </Badge>
            <Badge
              className="bg-white/15 text-white/95 backdrop-blur-sm"
              variant="muted"
            >
              {statusLabel}
            </Badge>
            <Badge
              className="bg-white/15 text-white/95 backdrop-blur-sm"
              variant="muted"
            >
              {originLabel}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
