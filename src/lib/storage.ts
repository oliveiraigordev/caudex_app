import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/** Salva imagem no Vercel Blob (produção) ou em public/uploads (dev local). */
export async function savePlantImage(file: File): Promise<string> {
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    try {
      const blob = await put(`plants/${filename}`, file, {
        access: "public",
        addRandomSuffix: false,
      });
      return blob.url;
    } catch (err) {
      console.error("[savePlantImage] Vercel Blob:", err);
      throw new Error(
        "Não foi possível salvar no armazenamento de imagens. Tente de novo em instantes.",
      );
    }
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}
