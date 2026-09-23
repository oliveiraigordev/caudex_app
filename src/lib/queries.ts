import { prisma } from "@/lib/db";
import { getAlertsBundle } from "@/lib/alerts-data";
import { sortAlerts } from "@/lib/alert-labels";
import { parsePollinationMeta } from "@/lib/pollination-metadata";
import { requireUserId } from "@/lib/session";

export async function getSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getPlantsWithEvents(userId: string) {
  return prisma.plant.findMany({
    where: { userId },
    orderBy: { code: "asc" },
    include: {
      location: true,
      events: { orderBy: { occurredAt: "desc" }, take: 30 },
      photos: { orderBy: { takenAt: "desc" }, take: 6 },
      parentMale: { select: { id: true, code: true, nickname: true } },
      parentFemale: { select: { id: true, code: true, nickname: true } },
    },
  });
}

export async function getPlantNeighbors(userId: string, currentId: string) {
  const plants = await prisma.plant.findMany({
    where: { userId },
    orderBy: { code: "asc" },
    select: { id: true, code: true, nickname: true },
  });
  const index = plants.findIndex((p) => p.id === currentId);
  if (index === -1) {
    return { prev: null, next: null, position: 0, total: plants.length };
  }
  return {
    prev: index > 0 ? plants[index - 1] : null,
    next: index < plants.length - 1 ? plants[index + 1] : null,
    position: index + 1,
    total: plants.length,
  };
}

export async function getNewPlantPageData(userId: string) {
  const [locations, plants, pollinationEvents, allCodes] = await Promise.all([
    prisma.cultivationLocation.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.plant.findMany({
      where: { userId },
      orderBy: { code: "asc" },
      select: { id: true, code: true, nickname: true },
    }),
    prisma.plantEvent.findMany({
      where: { type: "POLINIZACAO", plant: { userId } },
      orderBy: { occurredAt: "desc" },
      take: 80,
      include: {
        plant: { select: { id: true, code: true, nickname: true } },
      },
    }),
    prisma.plant.findMany({
      where: { userId },
      select: { code: true },
    }),
  ]);

  const pollinations = pollinationEvents.map((ev) => {
    const meta = parsePollinationMeta(ev.metadata);
    return {
      id: ev.id,
      occurredAt: ev.occurredAt.toISOString(),
      title: ev.title ?? "Polinização",
      motherId: ev.plant.id,
      motherCode: ev.plant.code,
      motherNickname: ev.plant.nickname,
      malePlantId: meta?.malePlantId ?? null,
      malePlantCode: meta?.malePlantCode ?? null,
      maleExternal: meta?.maleExternal ?? null,
    };
  });

  return {
    locations,
    plants,
    pollinations,
    existingCodes: allCodes.map((p) => p.code),
  };
}

export async function getPlantFormOptions(userId: string, excludePlantId: string) {
  const [locations, plants] = await Promise.all([
    prisma.cultivationLocation.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.plant.findMany({
      where: { userId, id: { not: excludePlantId } },
      orderBy: { code: "asc" },
      select: { id: true, code: true, nickname: true },
    }),
  ]);
  return { locations, plants };
}

export async function getPlantById(userId: string, id: string) {
  return prisma.plant.findFirst({
    where: { id, userId },
    include: {
      location: true,
      events: {
        orderBy: { occurredAt: "desc" },
        include: { photos: true },
      },
      photos: { orderBy: { takenAt: "desc" } },
      parentMale: { select: { id: true, code: true, nickname: true } },
      parentFemale: { select: { id: true, code: true, nickname: true } },
    },
  });
}

export async function ensureDefaultLocation(userId: string) {
  const existing = await prisma.cultivationLocation.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;
  return prisma.cultivationLocation.create({
    data: {
      userId,
      name: "Principal",
      exposedToRain: true,
      notes: "Local padrão em Bananal/SP",
    },
  });
}

export async function getDashboardData() {
  const userId = await requireUserId();
  const bundle = await getAlertsBundle(userId);
  const activeIds = new Set(bundle.activeAlerts.map((a) => a.id));
  const completedAlerts = sortAlerts(
    bundle.allAlerts.filter((a) => !activeIds.has(a.id)),
  );
  return {
    plants: bundle.plants,
    settings: bundle.settings,
    weather: bundle.weather,
    weatherError: bundle.weatherError,
    alerts: bundle.activeAlerts,
    allAlertsCount: bundle.allAlerts.length,
    dismissedCount: bundle.dismissedCount,
    completedAlerts,
  };
}
