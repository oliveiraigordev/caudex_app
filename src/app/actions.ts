"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  dismissAlertById,
  dismissAlerts,
  restoreAllDismissalsToday,
} from "@/lib/alert-dismissals";
import { getAlertsBundle } from "@/lib/alerts-data";
import { requireOwnedPlant } from "@/lib/plant-access";
import { ensureDefaultLocation } from "@/lib/queries";
import { requireUserId } from "@/lib/session";
import { savePlantImage } from "@/lib/storage";

function revalidateAlerts() {
  revalidatePath("/");
  revalidatePath("/plantas", "layout");
}
import type { EventType, PlantOrigin, PlantPhase, PlantStatus } from "@prisma/client";
import { applyAutoPhase } from "@/lib/plant-phase-auto";
import { resolvePotFromPreset } from "@/lib/pot-sizes";
import { repotEventTitle } from "@/lib/repot-metadata";
import type { PollinationResultOutcome } from "@/lib/pollination-metadata";
export async function updateEventOccurredAt(input: {
  eventId: string;
  plantId: string;
  occurredAt: string;
}) {
  const userId = await requireUserId();
  await requireOwnedPlant(input.plantId, userId);
  const parsed = new Date(input.occurredAt);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Data inválida");
  }
  await prisma.plantEvent.update({
    where: { id: input.eventId },
    data: { occurredAt: parsed },
  });
  revalidateAlerts();
  revalidatePath("/plantas");
  revalidatePath(`/plantas/${input.plantId}`);
}

export async function createEvent(input: {
  plantId: string;
  type: EventType;
  occurredAt?: string;
  notes?: string;
  title?: string;
  metadata?: string;
  potPreset?: string;
  potDiameterCm?: number;
  potVolumeLiters?: number;
  potLabel?: string;
  substrateNotes?: string;
}) {
  const userId = await requireUserId();
  await requireOwnedPlant(input.plantId, userId);

  if (input.type === "REPLANTIO") {
    if (!input.potPreset) {
      throw new Error("Informe o tamanho do vaso no replantio");
    }
    const potData = resolvePotFromPreset(
      input.potPreset,
      input.potDiameterCm,
      input.potVolumeLiters,
      input.potLabel,
    );
    const repotMeta = JSON.stringify({
      ...potData,
      substrateNotes: input.substrateNotes,
    });
    await prisma.$transaction([
      prisma.plantEvent.create({
        data: {
          plantId: input.plantId,
          type: "REPLANTIO",
          occurredAt: input.occurredAt
            ? new Date(input.occurredAt)
            : new Date(),
          notes: input.notes,
          title: repotEventTitle(repotMeta),
          metadata: repotMeta,
        },
      }),
      prisma.plant.update({
        where: { id: input.plantId },
        data: {
          ...potData,
          ...(input.substrateNotes
            ? { substrateNotes: input.substrateNotes }
            : {}),
        },
      }),
    ]);
    revalidateAlerts();
    revalidatePath("/plantas");
    revalidatePath(`/plantas/${input.plantId}`);
    return;
  }

  await prisma.plantEvent.create({
    data: {
      plantId: input.plantId,
      type: input.type,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
      notes: input.notes,
      title: input.title,
      metadata: input.metadata,
    },
  });
  revalidateAlerts();
  revalidatePath("/plantas");
  revalidatePath(`/plantas/${input.plantId}`);
}

export async function createBulkEvents(input: {
  plantIds: string[];
  type: "REGA" | "ADUBACAO" | "REPLANTIO";
  occurredAt: string;
  notes?: string;
  fertilizerType?: string;
  fertilizerDose?: string;
  potPreset?: string;
  potDiameterCm?: number;
  potVolumeLiters?: number;
  potLabel?: string;
  substrateNotes?: string;
}) {
  const userId = await requireUserId();
  if (input.plantIds.length === 0) {
    throw new Error("Selecione ao menos uma planta");
  }
  const occurred = new Date(input.occurredAt);
  if (Number.isNaN(occurred.getTime())) {
    throw new Error("Data inválida");
  }

  const ownedCount = await prisma.plant.count({
    where: { userId, id: { in: input.plantIds } },
  });
  if (ownedCount !== input.plantIds.length) {
    throw new Error("Seleção de plantas inválida");
  }

  if (input.type === "REPLANTIO" && !input.potPreset) {
    throw new Error("Informe o tamanho do vaso no replantio");
  }

  const potData =
    input.type === "REPLANTIO" && input.potPreset
      ? resolvePotFromPreset(
          input.potPreset,
          input.potDiameterCm,
          input.potVolumeLiters,
          input.potLabel,
        )
      : null;

  const repotMeta =
    input.type === "REPLANTIO" && potData
      ? JSON.stringify({
          ...potData,
          substrateNotes: input.substrateNotes,
        })
      : null;

  const metadata =
    input.type === "ADUBACAO"
      ? JSON.stringify({
          fertilizerType: input.fertilizerType,
          dose: input.fertilizerDose,
        })
      : input.type === "REPLANTIO"
        ? repotMeta
        : null;

  const title =
    input.type === "ADUBACAO"
      ? input.fertilizerType || "Adubação"
      : input.type === "REPLANTIO"
        ? repotEventTitle(repotMeta)
        : undefined;

  const ops = input.plantIds.flatMap((plantId) => {
    const creates = prisma.plantEvent.create({
      data: {
        plantId,
        type: input.type,
        occurredAt: occurred,
        notes: input.notes,
        title,
        metadata,
      },
    });
    if (input.type === "REPLANTIO" && potData) {
      return [
        creates,
        prisma.plant.update({
          where: { id: plantId },
          data: {
            ...potData,
            ...(input.substrateNotes
              ? { substrateNotes: input.substrateNotes }
              : {}),
          },
        }),
      ];
    }
    return [creates];
  });

  await prisma.$transaction(ops);

  revalidateAlerts();
  revalidatePath("/");
  revalidatePath("/plantas");
  for (const plantId of input.plantIds) {
    revalidatePath(`/plantas/${plantId}`);
  }
}

export async function deleteEvent(eventId: string, plantId: string) {
  const userId = await requireUserId();
  await requireOwnedPlant(plantId, userId);
  await prisma.plantEvent.delete({ where: { id: eventId } });
  revalidateAlerts();
  revalidatePath("/plantas");
  revalidatePath(`/plantas/${plantId}`);
}

export async function updatePlant(
  id: string,
  data: {
    nickname?: string | null;
    heightCm?: number | null;
    phase?: PlantPhase;
    status?: PlantStatus;
    origin?: PlantOrigin;
    substrateNotes?: string | null;
    sunExposurePercent?: number;
    locationId?: string | null;
    arrivedAt?: string;
    parentMaleId?: string | null;
    parentFemaleId?: string | null;
    potPreset?: string | null;
    potDiameterCm?: number | null;
    potVolumeLiters?: number | null;
    potLabel?: string | null;
  },
) {
  const userId = await requireUserId();
  await requireOwnedPlant(id, userId);
  const { arrivedAt, ...rest } = data;
  await prisma.plant.update({
    where: { id },
    data: {
      ...rest,
      ...(arrivedAt !== undefined
        ? { arrivedAt: new Date(arrivedAt) }
        : {}),
    },
  });
  revalidateAlerts();
  revalidatePath("/");
  revalidatePath("/plantas");
  revalidatePath(`/plantas/${id}`);
}

export async function updatePlantFromForm(plantId: string, formData: FormData) {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const heightRaw = String(formData.get("heightCm") ?? "").trim();
  const sunRaw = String(formData.get("sunExposurePercent") ?? "").trim();
  const substrate = String(formData.get("substrateNotes") ?? "").trim();
  const parentMale = String(formData.get("parentMaleId") ?? "");
  const parentFemale = String(formData.get("parentFemaleId") ?? "");
  const locationId = String(formData.get("locationId") ?? "");
  const potPreset = String(formData.get("potPreset") ?? "").trim();
  const potDiameterRaw = String(formData.get("potDiameterCm") ?? "").trim();
  const potVolumeRaw = String(formData.get("potVolumeLiters") ?? "").trim();
  const potLabel = String(formData.get("potLabel") ?? "").trim();
  const potResolved = potPreset
    ? resolvePotFromPreset(
        potPreset,
        potDiameterRaw ? Number(potDiameterRaw) : null,
        potVolumeRaw ? Number(potVolumeRaw) : null,
        potLabel || null,
      )
    : null;
  const heightCm = heightRaw ? Number(heightRaw) : null;
  const manualPhase = formData.get("phase") as PlantPhase;
  const autoPhase = formData.get("autoPhase") === "on";
  const phase = autoPhase
    ? applyAutoPhase(manualPhase, heightCm)
    : manualPhase;

  await updatePlant(plantId, {
    nickname: nickname || null,
    heightCm,
    phase,
    status: formData.get("status") as PlantStatus,
    origin: formData.get("origin") as PlantOrigin,
    substrateNotes: substrate || null,
    sunExposurePercent: sunRaw ? Number(sunRaw) : 80,
    locationId: locationId || null,
    arrivedAt: String(formData.get("arrivedAt") ?? ""),
    parentMaleId: parentMale || null,
    parentFemaleId: parentFemale || null,
    ...(potPreset && potResolved
      ? potResolved
      : {
          potPreset: null,
          potDiameterCm: null,
          potVolumeLiters: null,
          potLabel: null,
        }),
  });
}

export async function createPlant(input: {
  code: string;
  nickname?: string;
  origin?: PlantOrigin;
  heightCm?: number;
  locationId?: string;
}) {
  const userId = await requireUserId();
  let locationId = input.locationId;
  if (locationId) {
    const loc = await prisma.cultivationLocation.findFirst({
      where: { id: locationId, userId },
    });
    if (!loc) throw new Error("Local inválido");
  } else {
    locationId = (await ensureDefaultLocation(userId)).id;
  }

  const plant = await prisma.plant.create({
    data: {
      userId,
      code: input.code,
      nickname: input.nickname,
      origin: input.origin ?? "SEMENTE",
      heightCm: input.heightCm,
      locationId,
      phase: "MUDA_SEMENTE",
      status: "SAUDAVEL",
    },
  });

  await prisma.plantEvent.create({
    data: {
      plantId: plant.id,
      type: "CHEGADA",
      title: "Planta cadastrada",
    },
  });

  revalidatePath("/");
  revalidatePath("/plantas");
  return plant.id;
}

export async function createPollinationEvent(formData: FormData) {
  const userId = await requireUserId();
  const plantId = String(formData.get("plantId") ?? "");
  const occurredAt = String(formData.get("occurredAt") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const malePlantId = String(formData.get("malePlantId") ?? "").trim();
  const maleExternal = String(formData.get("maleExternal") ?? "").trim();
  const method = String(formData.get("method") ?? "").trim();
  const file = formData.get("file") as File | null;
  const caption = String(formData.get("caption") ?? "").trim();

  if (!plantId) throw new Error("Planta obrigatória");
  await requireOwnedPlant(plantId, userId);

  let malePlantCode: string | null = null;
  if (malePlantId) {
    const male = await prisma.plant.findFirst({
      where: { id: malePlantId, userId },
      select: { code: true },
    });
    malePlantCode = male?.code ?? null;
  }

  const event = await prisma.plantEvent.create({
    data: {
      plantId,
      type: "POLINIZACAO",
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      title: malePlantCode
        ? `Polinização com ${malePlantCode}`
        : maleExternal
          ? `Polinização com ${maleExternal}`
          : "Polinização registrada",
      notes: notes || undefined,
      metadata: JSON.stringify({
        role: "MAE",
        malePlantId: malePlantId || null,
        malePlantCode,
        maleExternal: maleExternal || null,
        method: method || undefined,
      }),
    },
  });

  if (file?.size) {
    const photoPath = await savePlantImage(file);
    await prisma.plantPhoto.create({
      data: {
        plantId,
        eventId: event.id,
        path: photoPath,
        caption: caption || "Polinização",
      },
    });
  }

  revalidateAlerts();
  revalidatePath("/plantas");
  revalidatePath(`/plantas/${plantId}`);
}

export async function createPollinationResultEvent(formData: FormData) {
  const userId = await requireUserId();
  const plantId = String(formData.get("plantId") ?? "");
  const occurredAt = String(formData.get("occurredAt") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const pollinationEventId = String(formData.get("pollinationEventId") ?? "").trim();
  const outcome = String(formData.get("outcome") ?? "") as PollinationResultOutcome;
  const seedCountRaw = String(formData.get("seedCount") ?? "").trim();
  const file = formData.get("file") as File | null;
  const caption = String(formData.get("caption") ?? "").trim();

  if (!plantId || !outcome) throw new Error("Dados incompletos");
  await requireOwnedPlant(plantId, userId);

  const event = await prisma.plantEvent.create({
    data: {
      plantId,
      type: "RESULTADO_POLINIZACAO",
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      title: "Resultado da polinização",
      notes: notes || undefined,
      metadata: JSON.stringify({
        pollinationEventId: pollinationEventId || null,
        outcome,
        seedCount: seedCountRaw ? Number(seedCountRaw) : null,
      }),
    },
  });

  if (file?.size) {
    const photoPath = await savePlantImage(file);
    await prisma.plantPhoto.create({
      data: {
        plantId,
        eventId: event.id,
        path: photoPath,
        caption: caption || "Resultado polinização",
      },
    });
  }

  revalidateAlerts();
  revalidatePath("/plantas");
  revalidatePath(`/plantas/${plantId}`);
}

export async function uploadPlantPhoto(formData: FormData) {
  const userId = await requireUserId();
  const plantId = formData.get("plantId") as string;
  const eventId = (formData.get("eventId") as string) || undefined;
  const caption = (formData.get("caption") as string) || undefined;
  const file = formData.get("file") as File | null;

  if (!plantId || !file?.size) {
    throw new Error("Planta e arquivo são obrigatórios");
  }
  await requireOwnedPlant(plantId, userId);

  const photoPath = await savePlantImage(file);

  const photo = await prisma.plantPhoto.create({
    data: {
      plantId,
      eventId: eventId || null,
      path: photoPath,
      caption,
    },
  });

  if (!eventId) {
    await prisma.plantEvent.create({
      data: {
        plantId,
        type: "FOTO",
        title: "Foto de acompanhamento",
        notes: caption,
      },
    });
  }

  revalidatePath(`/plantas/${plantId}`);
  revalidateAlerts();
  return photo.id;
}

export async function dismissAlert(alertId: string) {
  const userId = await requireUserId();
  const { allAlerts } = await getAlertsBundle(userId);
  await dismissAlertById(userId, alertId, allAlerts);
  revalidateAlerts();
}

export async function dismissAllAlerts() {
  const userId = await requireUserId();
  const { activeAlerts } = await getAlertsBundle(userId);
  await dismissAlerts(userId, activeAlerts);
  revalidateAlerts();
}

export async function restoreDismissedAlerts() {
  const userId = await requireUserId();
  await restoreAllDismissalsToday(userId);
  revalidateAlerts();
}
