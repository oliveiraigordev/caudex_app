/**
 * Seed opcional — exige usuário já criado via login.
 * Uso: SEED_USER_EMAIL=seu@gmail.com npm run db:seed
 */
import { PrismaClient, PlantPhase, PlantOrigin, PlantStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  if (!email) {
    console.log("Defina SEED_USER_EMAIL para popular mudas de exemplo.");
    return;
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: process.env.SEED_USER_NAME ?? "Cultivador",
        emailVerified: new Date(),
      },
    });
    console.log(`Usuário criado para seed: ${email}`);
  }

  const existingLocation = await prisma.cultivationLocation.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  const location =
    existingLocation ??
    await prisma.cultivationLocation.create({
      data: {
        userId: user.id,
        name: "Principal",
        exposedToRain: true,
        notes: "Local padrão em Bananal/SP",
      },
    });

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  for (let i = 1; i <= 9; i++) {
    const code = `RD-${String(i).padStart(3, "0")}`;
    await prisma.plant.upsert({
      where: { userId_code: { userId: user.id, code } },
      update: {},
      create: {
        userId: user.id,
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

  console.log(`Seed OK para ${email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
