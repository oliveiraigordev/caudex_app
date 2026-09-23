import { put } from "@vercel/blob";
import { getVercelOidcToken } from "@vercel/oidc";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

type BlobPutOptions = {
  access: "public" | "private";
  addRandomSuffix: false;
  token?: string;
  oidcToken?: string;
  storeId?: string;
};

async function resolveBlobPutOptions(): Promise<BlobPutOptions | null> {
  const storeAccess = process.env.BLOB_STORE_ACCESS?.toLowerCase();
  const access: "public" | "private" =
    storeAccess === "private" ? "private" : "public";

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (token) {
    return { access, addRandomSuffix: false, token };
  }

  const storeId = process.env.BLOB_STORE_ID?.trim();
  if (!storeId) return null;

  let oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim();
  if (!oidcToken) {
    try {
      oidcToken = await getVercelOidcToken();
    } catch {
      oidcToken = undefined;
    }
  }

  if (!oidcToken) return null;

  return {
    access,
    addRandomSuffix: false,
    storeId,
    oidcToken,
  };
}

function mapBlobUploadError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("Cannot use public access on a private store")) {
    return "O armazenamento de imagens está como privado na Vercel. Defina BLOB_STORE_ACCESS=private ou use um Blob store público.";
  }
  if (message.includes("No token found") || message.includes("AccessToken")) {
    return "Armazenamento de imagens sem credenciais. Conecte o Blob store ao projeto na Vercel.";
  }
  return "Não foi possível salvar no armazenamento de imagens. Tente de novo em instantes.";
}

/** Salva imagem no Vercel Blob (produção) ou em public/uploads (dev local). */
export async function savePlantImage(file: File): Promise<string> {
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;

  const blobOptions = await resolveBlobPutOptions();
  if (blobOptions) {
    try {
      const blob = await put(`plants/${filename}`, file, blobOptions);
      return blob.url;
    } catch (err) {
      console.error("[savePlantImage] Vercel Blob:", err);
      throw new Error(mapBlobUploadError(err));
    }
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), bytes);
  return `/uploads/${filename}`;
}
