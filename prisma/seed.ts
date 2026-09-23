import { PrismaClient, PlantPhase, PlantOrigin, PlantStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const location = await prisma.cultivationLocation.upsert({
    where: { id: "default-location" },
    update: {},
    create: {
      id: "default-location",
      name: "Principal",
      exposedToRain: true,
      notes: "Local padrão em Bananal/SP",
    },
  });

  await prisma.userSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {},
  });

  for (let i = 1; i <= 9; i++) {
    const code = `RD-${String(i).padStart(3, "0")}`;
    await prisma.plant.upsert({
      where: { code },
      update: {},
      create: {
        code,
        nickname: `Muda ${i}`,
        origin: PlantOrigin.SEMENTE,
        phase: PlantPhase.MUDA_SEMENTE,
        status: PlantStatus.SAUDAVEL,
        heightCm: 8,
        locationId: location.id,
        substrateNotes: "Substrato drenante (ajuste conforme seu mix)",
        sunExposurePercent: 80,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
