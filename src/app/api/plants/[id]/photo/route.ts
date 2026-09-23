import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPlantPhotoWithEvent } from "@/lib/plant-photo-upload";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Faça login para enviar fotos" }, { status: 401 });
  }

  const { id: plantId } = await context.params;
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) {
    return NextResponse.json({ error: "Arquivo de imagem obrigatório" }, { status: 400 });
  }

  const caption = String(formData.get("caption") ?? "").trim() || undefined;

  try {
    const photo = await createPlantPhotoWithEvent(userId, plantId, file, {
      caption,
      eventTitle: caption === "Capa da muda" ? "Foto da capa" : undefined,
    });
    return NextResponse.json({ id: photo.id, path: photo.path });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Não foi possível salvar a foto";
    console.error("[plant photo upload]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
