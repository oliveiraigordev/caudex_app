import { prisma } from "@/lib/db";

export async function requireOwnedPlant(plantId: string, userId: string) {
  const plant = await prisma.plant.findFirst({
    where: { id: plantId, userId },
  });
  if (!plant) {
    throw new Error("Planta não encontrada");
  }
  return plant;
}
