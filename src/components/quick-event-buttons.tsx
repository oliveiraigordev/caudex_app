"use client";

import { useState, useTransition } from "react";
import { createEvent, uploadPlantPhoto } from "@/app/actions";
import type { EventType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PotFields } from "@/components/pot-fields";
import { quickEventTypes, eventTypeLabels } from "@/lib/labels";
import {
  Camera,
  Droplets,
  FlaskConical,
  Flower2,
  MessageSquare,
  Shovel,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const inputClass =
  "mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c45c4a]/15";

const eventIcons: Partial<Record<EventType, LucideIcon>> = {
  REGA: Droplets,
  ADUBACAO: FlaskConical,
  REPLANTIO: Shovel,
  FOTO: Camera,
  NOTA: MessageSquare,
  FLORACAO: Flower2,
  DOENCA: Stethoscope,
};

export function QuickEventButtons({
  plantId,
  currentPotPreset = "",
}: {
  plantId: string;
  currentPotPreset?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [repotOpen, setRepotOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  function register(type: EventType) {
    if (type === "REPLANTIO") {
      setPhotoOpen(false);
      setRepotOpen(true);
      return;
    }
    if (type === "FOTO") {
      setRepotOpen(false);
      setPhotoOpen(true);
      return;
    }
    startTransition(async () => {
      await createEvent({ plantId, type });
    });
  }

  function submitPhoto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("plantId", plantId);
    startTransition(async () => {
      await uploadPlantPhoto(fd);
      setPhotoOpen(false);
      form.reset();
    });
  }

  function submitRepot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const potPreset = String(fd.get("potPreset") ?? "").trim();
    if (!potPreset) return;
    const potDiameter = String(fd.get("potDiameterCm") ?? "").trim();
    const potVolume = String(fd.get("potVolumeLiters") ?? "").trim();
    const potLabel = String(fd.get("potLabel") ?? "").trim();
    const substrate = String(fd.get("substrateNotes") ?? "").trim();
    const notes = String(fd.get("notes") ?? "").trim();

    startTransition(async () => {
      await createEvent({
        plantId,
        type: "REPLANTIO",
        potPreset,
        potDiameterCm: potDiameter ? Number(potDiameter) : undefined,
        potVolumeLiters: potVolume ? Number(potVolume) : undefined,
        potLabel: potLabel || undefined,
        substrateNotes: substrate || undefined,
        notes: notes || undefined,
      });
      setRepotOpen(false);
      e.currentTarget.reset();
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {quickEventTypes.map((type) => {
          const Icon = eventIcons[type];
          const isWater = type === "REGA";
          const isRepot = type === "REPLANTIO";
          const isPhoto = type === "FOTO";
          return (
            <Button
              key={type}
              type="button"
              size="sm"
              variant={
                isWater ||
                (isRepot && repotOpen) ||
                (isPhoto && photoOpen)
                  ? "default"
                  : "secondary"
              }
              disabled={pending}
              className="h-auto min-h-10 justify-start px-3 py-2.5"
              onClick={() => register(type)}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0 opacity-90" />}
              <span className="truncate text-left">{eventTypeLabels[type]}</span>
            </Button>
          );
        })}
      </div>

      {photoOpen && (
        <form
          onSubmit={submitPhoto}
          className="space-y-3 rounded-xl border border-violet-200/80 bg-violet-50/40 p-3"
        >
          <p className="text-xs text-stone-600">
            A imagem entra na <strong>galeria</strong> e na{" "}
            <strong>linha do tempo</strong>.
          </p>
          <label className="block text-sm font-medium text-stone-700">
            Imagem
            <input
              name="file"
              type="file"
              accept="image/*"
              capture="environment"
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-900"
              required
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Legenda (opcional)
            <input
              name="caption"
              className={inputClass}
              placeholder="Ex.: caudex após replantio"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Enviando…" : "Salvar foto"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => setPhotoOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {repotOpen && (
        <form
          onSubmit={submitRepot}
          className="space-y-3 rounded-xl border border-amber-200/80 bg-amber-50/40 p-3"
        >
          <p className="text-xs text-stone-600">
            O replantio registra na linha do tempo e{" "}
            <strong>atualiza o vaso nos dados da planta</strong>.
          </p>
          <PotFields defaultPreset={currentPotPreset ?? ""} />
          <label className="block text-sm font-medium text-stone-700">
            Substrato (opcional)
            <input
              name="substrateNotes"
              className={inputClass}
              placeholder="Mix usado no replantio"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Observações
            <input name="notes" className={inputClass} placeholder="Opcional" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Salvando…" : "Confirmar replantio"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => setRepotOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
