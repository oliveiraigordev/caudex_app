/** Reduz tamanho e converte para JPEG (útil para HEIC e fotos grandes no celular). */
export async function prepareCoverImage(file: File): Promise<File> {
  const maxDim = 1920;
  const quality = 0.88;

  if (
    file.type === "image/jpeg" &&
    file.size < 2_500_000 &&
    !/\.heic$/i.test(file.name)
  ) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });
    if (!blob) return file;

    const base = file.name.replace(/\.[^.]+$/i, "") || "capa";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
