import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireOwnedPlant } from "@/lib/plant-access";
import { savePlantImage } from "@/lib/storage";

function revalidatePlantPhotoPaths(plantId: string) {
  revalidatePath("/");
  revalidatePath("/plantas");
  revalidatePath(`/plantas/${plantId}`);
}

export async function createPlantPhotoWithEvent(
  userId: string,
  plantId: string,
  file: File,
  options?: { caption?: string; eventTitle?: string },
) {
  if (!file?.size) {
    throw new Error("Selecione uma imagem válida");
  }
  await requireOwnedPlant(plantId, userId);

  const photoPath = await savePlantImage(file);
  const caption = options?.caption?.trim() || undefined;
  const title = options?.eventTitle ?? "Foto de acompanhamento";

  const photo = await prisma.$transaction(async (tx) => {
    const event = await tx.plantEvent.create({
      data: {
        plantId,
        type: "FOTO",
        title,
        notes: caption,
      },
    });
    return tx.plantPhoto.create({
      data: {
        plantId,
        eventId: event.id,
        path: photoPath,
        caption,
        takenAt: new Date(),
      },
    });
  });

  revalidatePlantPhotoPaths(plantId);
  return photo;
}
