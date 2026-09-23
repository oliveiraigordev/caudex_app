import { prisma } from "@/lib/db";
import { getAlertsBundle } from "@/lib/alerts-data";
import { sortAlerts } from "@/lib/alert-labels";

export async function getSettings() {
  return prisma.userSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {},
  });
}

export async function getPlantsWithEvents() {
  return prisma.plant.findMany({
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

export async function getPlantNeighbors(currentId: string) {
  const plants = await prisma.plant.findMany({
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

export async function getPlantFormOptions(excludePlantId: string) {
  const [locations, plants] = await Promise.all([
    prisma.cultivationLocation.findMany({ orderBy: { name: "asc" } }),
    prisma.plant.findMany({
      where: { id: { not: excludePlantId } },
      orderBy: { code: "asc" },
      select: { id: true, code: true, nickname: true },
    }),
  ]);
  return { locations, plants };
}

export async function getPlantById(id: string) {
  return prisma.plant.findUnique({
    where: { id },
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

export async function getDashboardData() {
  const bundle = await getAlertsBundle();
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
