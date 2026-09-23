const CODE_RE = /^RD-(\d+)$/i;

export function parsePlantCodeNumber(code: string): number | null {
  const m = CODE_RE.exec(code.trim());
  if (!m) return null;
  return parseInt(m[1], 10);
}

export function formatPlantCode(n: number): string {
  return `RD-${String(n).padStart(3, "0")}`;
}

export function nextPlantCodes(existingCodes: string[], quantity: number): string[] {
  let max = 0;
  for (const code of existingCodes) {
    const n = parsePlantCodeNumber(code);
    if (n != null && n > max) max = n;
  }
  const start = max + 1;
  return Array.from({ length: quantity }, (_, i) => formatPlantCode(start + i));
}
